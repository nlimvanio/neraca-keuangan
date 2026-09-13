import { cookies } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { decrypt } from "@/lib/session";

import pool from '@/lib/db';

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ transactionId: string }> }
) {
    const {transactionId} = await params;
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const dec = await decrypt(session);
    const userId = dec ? dec.userId : null ;

    if(!transactionId){
        return NextResponse.json(
            { message: "Transaction ID not provided" },
            { status: 400 }
        );
    }

    const connection = await pool.getConnection();

    try{
        await connection.beginTransaction();

        const updateTransactionSql = `
        UPDATE transactions
        SET paid = 1, payoff_by = ?
        WHERE id = ?
        `

        await connection.query({
            sql: updateTransactionSql,
            values: [userId, transactionId]
        });

        await connection.commit();
        return NextResponse.json(
            {message: "Transaction updated succesfuly"},
            {status: 200}
        )

    } catch (error){
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