import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { decrypt } from "@/lib/session";
/**
 * TODO:
 * - Create query for exporting hutang
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const cookieStore = await cookies();
        const session = cookieStore.get("session")?.value;
        const dec = await decrypt(session);
        const userId = dec ? dec.userId : null ;

        const page = Number(searchParams.get("page") ?? "1");
        const pageSize = Number(searchParams.get("pageSize") ?? "10");
        const search = searchParams.get("search");

        const offset = (page - 1) * pageSize;

        if (!userId) { return NextResponse.json({message:"Unauthorized Access"},{status:401})}
        

        let where = "";
        const searchValues = []

        if (search) {
            where = "AND (cp.name LIKE ? OR barcode LIKE ?)";
            searchValues.push(`%${search}%`, `%${search}%`);
        }

        const searchSql = `
        SELECT t.*, cp.name, cp.barcode
        FROM transactions t
        LEFT OUTER JOIN user_branch ub ON ub.branch_id = t.branch_id
        LEFT OUTER JOIN core_product cp ON cp.id = t.product_id 
        WHERE ub.user_id = ? AND t.paid = ? ${where}
        LIMIT ?
        OFFSET ?
        `

        const coreValues = [userId, 0];
        const paginationValues = [pageSize, offset];

        const [rows] = await pool.query(searchSql, [...coreValues, ...searchValues, ...paginationValues]);

        const countRowsSql = `
        SELECT COUNT(*) AS total
        FROM transactions t
        LEFT OUTER JOIN user_branch ub ON ub.branch_id = t.branch_id 
        LEFT OUTER JOIN core_product cp ON cp.id = t.product_id 
        WHERE ub.user_id = ? AND t.paid = ? ${where}
        `

        const [countRows]: any = await pool.query(countRowsSql, [...coreValues, ...searchValues])

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