import { NextResponse } from 'next/server';

import pool from '@/lib/db';

export async function GET(req: Request) {
    // this is going to be my JSON response
    try {
        const [results] = await pool.query('SELECT * FROM core_product');
        // response with the JSON object
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error executing query:', error);
        return NextResponse.json({
            message: error.message,
            code: error.code,
        }, { status: 500 }
        );
    }
}

