import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { decrypt } from "@/lib/session";
import { Pembelian, Penjualan } from "@/app/addTransaction/page";
import { Pengeluaran } from "@/app/addOperasional/page";
import { PoolConnection } from "mysql2/promise";


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
    const { transactions, transactionType } = body;
    console.log(transactions)
    console.log(transactionType)
    let response;

    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    const dec = await decrypt(cookie);
    const userId = dec ? dec.userId : "";

    if (transactionType === "penjualan" || transactionType === "pembelian") {
      response = await transactionStock(connection, transactionType, transactions, userId);
    } else if (transactionType === "pengeluaran") {
      response = await transactionPengeluaran(connection, transactions, userId);
    } else {
      return NextResponse.json(
        { message: "Invalid Transaction Type" },
        { status: 400 }
      )
    }
    await connection.commit();
    return response
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

async function transactionStock(connection: PoolConnection, transactionType: string, transactions: Penjualan[] | Pembelian[], userId: unknown) {
  let transaction_type = "";
  let method = "";
  let missingFields;
  if (transactionType === "penjualan") {
    transaction_type = "I";
    method = "-";
    missingFields = transactions.some((transaction: any) =>
      !transaction.productName || !transaction.transactionDate || !transaction.quantity
    )
  } else if (transactionType === "pembelian") {
    transaction_type = "O";
    method = "+";
    missingFields = transactions.some((transaction: any) =>
      !transaction.invoiceNo || !transaction.productName || !transaction.transactionDate || !transaction.quantity
    )
  } else {
    return NextResponse.json(
      { message: "Invalid transaction type" },
      { status: 400 }
    );
  }

  if (missingFields) {
    return NextResponse.json(
      { message: "Some transaction are missing required fields" },
      { status: 400 }
    )
  }

  const productIds = transactions.map(transaction => transaction.productId);
  const productSearchPlaceholders = productIds.map(() => "?").join(",");
  const sql = `
      SELECT cp.id AS product_id, cp.price, ub.branch_id 
      FROM core_product cp 
      LEFT JOIN user_branch ub ON ub.user_id = ?
      LEFT JOIN stock_branch sb ON sb.product_id = cp.id AND sb.branch_id = ub.branch_id 
      WHERE cp.id IN (${productSearchPlaceholders})
      `;
  const [result]: any = await connection.query(sql, [
    userId,
    ...productIds
  ]);
  if (result.length === 0) {
    return NextResponse.json(
      { message: "Products or branch not found" },
      { status: 404 }
    );
  }
  const branchId = result[0]?.branch_id;
  const productPriceMap = new Map();
  result.forEach((product: any) => {
    productPriceMap.set(product.product_id, product.price)
  });

  const placeholders = transactions.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(", ");

  const sql2 = `
      INSERT INTO transactions
      (transaction_date, product_id, transaction_type, quantity, amount, created_by, branch_id)
      VALUES ${placeholders}
    `;
  const insertValues = transactions.flatMap((transaction) => [
    transaction.transactionDate,
    transaction.productId,
    transaction_type,
    transaction.quantity,
    transaction.quantity * productPriceMap.get(transaction.productId),
    userId,
    branchId
  ])

  const [result2]: any = await connection.query(sql2, insertValues);

  const caseStatements = transactions.map(() => `WHEN product_id = ? THEN stock ${method} ?`).join(" ")


  const sql3 = `
    UPDATE stock_branch 
    SET stock = 
    CASE ${caseStatements} 
    ELSE stock 
    END
    WHERE branch_id = ? AND product_id IN (${productIds.map(() => "?").join(", ")})
  `

  const [result3]: any = await connection.query(sql3, [
    ...transactions.flatMap(t => [t.productId, t.quantity]),
    branchId,
    ...productIds
  ]);


  return NextResponse.json(
    {
      message: "Transaction created",
      id: result2.insertId,
    },
    { status: 201 }
  );
}

async function transactionPengeluaran(connection: PoolConnection, transactions: Pengeluaran[], userId: unknown) {
  transactions.map((transaction: Pengeluaran) => {
    if (!transaction.transactionDate || !transaction.amount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }
  })

  const sql = `
    SELECT branch_id
    FROM user_branch
    WHERE user_id = ?
  `

  const [result]: any = await connection.query(sql, [userId]);
  if (result.length < 1) {
    return NextResponse.json(
      { message: "Invalid user ID" },
      { status: 400 }
    )
  }
  const branchId = result[0]?.branch_id;

  const insertValues = transactions.flatMap(transaction => [
    transaction.transactionDate,
    null,
    "O",
    null,
    transaction.amount,
    userId,
    branchId
  ])

  const placeholder = transactions.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");

  const sql2 = `
    INSERT INTO transactions
    (transaction_date, product_id, transaction_type, quantity, amount, created_by, branch_id)
    VALUES ${placeholder}
  `
  const [result2]: any = await connection.query(sql2, insertValues)

  return NextResponse.json(
    { message: "Transaction created", id: result2.insertId },
    { status: 201 }
  )
}