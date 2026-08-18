import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

import pool from '@/lib/db';

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


        const selectProductSql = `
        SELECT t.quantity, t.id_product, t.transaction_type
        FROM transactions t
        LEFT OUTER JOIN core_product cp ON cp.id = t.id_product
        WHERE t.id = ?
        FOR UPDATE
        `;
        
        const [rows] = await connection.query<RowDataPacket[]>({
            sql: selectProductSql,
            values: [transactionId]
        });

        if(rows.length === 0){
            await connection.rollback();
            connection.release();
            return NextResponse.json(
                {message: "Invalid transaction ID"},
                {status: 404}    
            )
        };

        const {quantity, id_product, transaction_type} = rows[0]

        const updateProductSql = `
        UPDATE core_product cp
        SET stock = stock + ?
        WHERE cp.id = ?
        `

        const stockChange = transaction_type.toLowerCase()=="i"? -Number(quantity) : Number(quantity); 

        await connection.query({
            sql: updateProductSql,
            values: [stockChange, id_product]
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