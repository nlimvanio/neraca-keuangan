import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const page = Number(searchParams.get("page") ?? "1");
        const pageSize = Number(searchParams.get("pageSize") ?? "10");
        const search = searchParams.get("search");

        const offset = (page - 1) * pageSize;
        let where = "";
        const values: any[] = [];

        if (search) {
            where = "WHERE name LIKE ? OR barcode LIKE ?";
            values.push(`%${search}%`, `%${search}%`);
        }
        // get product query
        const dataSql = `
            SELECT id, name, barcode, price
            FROM core_product
            ${where}
            ORDER BY id ASC
            LIMIT ?
            OFFSET ?
        `;

        values.push(pageSize, offset);

        const [rows] = await pool.query(dataSql, values);

        // get count total product query
        const countSql = `
            SELECT COUNT(*) AS total
            FROM core_product
            ${where}
        `;

        const countValues = search
        ? [`%${search}%`, `%${search}%`]
        : [];

        const [countRows]: any = await pool.query(countSql, countValues);

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
  try {
    const body = await request.json();

    const { name, barcode, price } = body;

    if (!name || !barcode || price == null) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO core_product
      (name, barcode, price, stock)
      VALUES (?, ?, ?, 0)
    `;

    const [result]: any = await pool.query(sql, [
      name,
      barcode,
      price,
    ]);

    return NextResponse.json(
      {
        message: "Product created",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

