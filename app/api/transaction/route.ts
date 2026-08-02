import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  try {

    await connection.beginTransaction();
    const body = await request.json();
    let method = "";

    const { id_product, transaction_type, quantity, created_by } = body;

    if (!id_product || !transaction_type || quantity == null || created_by == null) {
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
      SELECT stock`+method+quantity+` as stock FROM core_product WHERE id = `+id_product;

    const [result]: any = await connection.query(sql, [
      id_product
    ]);

    if (result[0].stock < 0) {
      return NextResponse.json({ message: 'Product out of stock' },
        { status: 400 }
      );
    }

    const sql2 = `
      INSERT INTO transactions
      (transaction_date, id_product, transaction_type, quantity, created_by)
      VALUES (NOW(), ?, ?, ?, ?)
    `;

    const [result2]: any = await connection.query(sql2, [
      id_product,
      transaction_type,
      quantity,
      created_by
    ]);

    const sql3 = `
      UPDATE core_product SET stock = stock`+method+quantity+` WHERE id = `+id_product;

    const [result3]: any = await connection.query(sql3, [
      id_product,
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

