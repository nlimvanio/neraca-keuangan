import { NextRequest, NextResponse } from 'next/server';

import pool from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ barcode: string }> }
) {
    try {
        const { barcode } = await params;

        const [rows] = await pool.query(
            'SELECT * FROM core_product WHERE barcode = ?',
            [barcode]
        );

        const products = rows as any[];

        if (products.length === 0) {
            return NextResponse.json({ message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(products[0]);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Connection error' },
            { status: 500 }
        );
    }
}

