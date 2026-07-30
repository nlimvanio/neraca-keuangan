import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const email = searchParams.get("email");
        const id = searchParams.get("id");

        // Build SQL here
        let sql = "SELECT * FROM core_user WHERE 1=1";
        const values: any[] = [];

        //Add email parameter to the SQL
        if (email) {
            sql += " AND barcode = ?";
            values.push(email);
        }

        //Add id parameter to the SQL
        if (id) {
            sql += " AND id = ?";
            values.push(`%${id}%`);
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