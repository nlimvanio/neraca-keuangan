import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ transactionId: string }> }
) {
    const {transactionId} = await params;
    if(!transactionId){
        return NextResponse.json(
            { message: "Transaction ID not provided" },
            { status: 400 }
        );
    }

    const connection = await pool.getConnection();

    try{
        await connection.beginTransaction();

        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        const dec = await decrypt(cookie);
        const userId = dec ? dec.userId : "";

        const selectProductSql = `
        SELECT t.id, t.quantity, t.product_id,
        t.transaction_type, t.branch_id
        FROM transactions t
        WHERE t.id = ?
        AND EXISTS (
            SELECT 1
            FROM user_branch ub
            WHERE ub.user_id = ?
            AND ub.branch_id = t.branch_id
        )
        FOR UPDATE
        `;
        
        const [rows] = await connection.query<RowDataPacket[]>({
            sql: selectProductSql,
            values: [transactionId, userId]
        });

        if(rows.length === 0){
            await connection.rollback();
            connection.release();
            return NextResponse.json(
                {message: "Invalid transaction ID"},
                {status: 404}    
            )
        };

        const {quantity, product_id, transaction_type, branch_id} = rows[0]

        const updateProductSql = `
        UPDATE stock_branch b
        SET stock = stock + ?
        WHERE b.branch_id = ? AND b.product_id = ?
        `

        const stockChange = transaction_type.toLowerCase()=="i"? -Number(quantity) : Number(quantity); 

        await connection.query({
            sql: updateProductSql,
            values: [stockChange, branch_id,product_id]
        });

        const deleteSql = `
        DELETE 
        FROM transactions
        WHERE id = ?
        `;

        await connection.query({
            sql : deleteSql,
            values: [transactionId]
        });

        await connection.commit();
        return NextResponse.json(
            {message: "Transaction deleted succesfuly"},
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