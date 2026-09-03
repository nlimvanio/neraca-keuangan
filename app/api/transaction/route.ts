import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { decrypt } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const page = Number(searchParams.get("page") ?? "1");
        const pageSize = Number(searchParams.get("pageSize") ?? "10");
        const search = searchParams.get("search");

        const offset = (page - 1) * pageSize;
        let where = "";
        const values: any[] = [];

        //Get userId
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        const dec = await decrypt(cookie);
        const userId = dec ? dec.userId : "";

        values.push(userId);

        if (search) {
            where = "AND (cp.name LIKE ? OR barcode LIKE ?)";
            values.push(`%${search}%`, `%${search}%`);
        }
        // get transaction query
        const dataSql = `
            SELECT t.id, transaction_date, cp.name, barcode, transaction_type, quantity, amount, cu.name as created_by
            FROM transactions t
            LEFT JOIN core_product cp ON cp.id = t.product_id 
            LEFT JOIN core_user cu ON cu.id = t.created_by
            LEFT JOIN user_branch ub ON ub.branch_id = t.branch_id 
            WHERE ub.user_id = ?
            ${where}
            ORDER BY t.id DESC
            LIMIT ?
            OFFSET ?
        `;

        values.push(pageSize, offset);

        const [rows] = await pool.query(dataSql, values);

        // get count total transaction query
        const countSql = `
            SELECT COUNT(*) AS total
            FROM transactions t
            LEFT JOIN core_product cp ON cp.id = t.product_id 
            LEFT JOIN user_branch ub ON ub.branch_id = t.branch_id 
            WHERE ub.user_id = ?
            ${where}
        `;

        const [countRows]: any = await pool.query(countSql, values);

        return NextResponse.json({
            data: rows,
            page,
            pageSize,
            total: countRows[0].total,
            totalPages: Math.ceil(countRows[0].total / pageSize),
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {

    await connection.beginTransaction();
    const body = await request.json();
    let method = "";

    const { product_id, transaction_type, quantity } = body;

    const token = (await cookies()).get("session")?.value;
    const created_by = (await decrypt(token))?.userId;
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    const dec = await decrypt(cookie);
    const userId = dec ? dec.userId : "";

    if (!product_id || !transaction_type || quantity == null) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if(transaction_type == "I"){
      method = "+";
    }
    else{
      method = "-";
    }

    const sql = `
      SELECT cp.id AS product_id, cp.price, COALESCE(sb.stock`+method+quantity+`, 0) AS stock, ub.branch_id FROM core_product cp LEFT JOIN user_branch ub ON ub.user_id = `+1+` LEFT JOIN stock_branch sb ON sb.product_id = cp.id AND sb.branch_id = ub.branch_id WHERE cp.id =`+ product_id;
    const [result]: any = await connection.query(sql, [
      userId,
      product_id
    ]);

    if (result[0].stock < 0) {
      return NextResponse.json({ message: 'Product out of stock' },
        { status: 400 }
      );
    }

    const sql2 = `
      INSERT INTO transactions
      (transaction_date, product_id, transaction_type, quantity, amount, created_by, branch_id)
      VALUES (NOW(), ?, ?, ?, ?, ?, ?)
    `;

    const [result2]: any = await connection.query(sql2, [
      product_id,
      transaction_type,
      quantity,
      quantity*result[0].price,
      created_by,
      result[0].branch_id
    ]);

    const sql3 = `
      UPDATE stock_branch SET stock = stock`+method+quantity+` WHERE product_id = `+product_id +` AND branch_id = `+result[0].branch_id;

    const [result3]: any = await connection.query(sql3, [
      product_id,
      quantity
    ]);

    await connection.commit();
    return NextResponse.json(
      {
        message: "Transaction created",
        id: result2.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

