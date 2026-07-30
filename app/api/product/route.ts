import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const barcode = searchParams.get("barcode");
        const name = searchParams.get("name");
        const price = searchParams.get("price");

        // Build SQL here
        let sql = "SELECT * FROM core_product WHERE 1=1";
        const values: any[] = [];

        if (barcode) {
            sql += " AND barcode = ?";
            values.push(barcode);
        }

        if (name) {
            sql += " AND name LIKE ?";
            values.push(`%${name}%`);
        }

        if (price) {
            sql += " AND price = ?";
            values.push(price);
        }

        // Execute SQL here
        const [rows] = await pool.query(sql, values);

        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

