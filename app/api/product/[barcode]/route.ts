import { NextRequest, NextResponse } from 'next/server';

import pool from '@/lib/db';

//Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ barcode: string }> }
) {
    const { barcode } = await params;
    if (!barcode) {
        return NextResponse.json(
            { message: 'Invalid request' },
            { status: 400 }
        );
    }

    const [result] = await pool.query(
        'DELETE FROM core_product WHERE barcode = ?',
        [barcode]
    );

    const deleteResult = result as { affectedRows: number };

    if (deleteResult.affectedRows === 0) {
        return NextResponse.json(
            { message: 'Product not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(
        { message: 'Product deleted successfully' },
        { status: 200 }
    );
}

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

