import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import pool from "@/lib/db";

export async function GET(request : NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
        return NextResponse.json(
            { message: "Start date and end date are required" },
            { status: 400 }
        );
    }

    interface TransactionRow {
        transaction_date: Date;
        name: string;
        barcode: string;
        quantity: number;
        transaction_type: string;
        created_by: string;
    }

    const sql = `
      SELECT
        transaction_date,
        cp.name,
        cp.barcode,
        quantity,
        CASE 
            WHEN transaction_type = 'I' THEN 'Beli'
            ELSE 'Jual'
        END
        transaction_type,
        cu.name created_by
      FROM transactions t
      LEFT JOIN core_product cp ON cp.id = t.id_product
      LEFT JOIN core_user cu ON cu.id = t.created_by
      WHERE transaction_date >= ?
        AND transaction_date < DATE_ADD(?, INTERVAL 1 DAY)
      ORDER BY transaction_date DESC
    `;

    const [rows] = await pool.query(sql, [
        startDate,
        endDate,
    ]);

    const transactions = rows as TransactionRow[];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    worksheet.columns = [
      {
        header: "Transaction Date",
        key: "transaction_date",
        width: 22,
      },
      {
        header: "Product",
        key: "name",
        width: 15,
      },
      {
        header: "Barcode",
        key: "barcode",
        width: 15,
      },
      {
        header: "Quantity",
        key: "quantity",
        width: 15,
      },
      {
        header: "Transaction Type",
        key: "transaction_type",
        width: 20,
      },
      {
        header: "Created By",
        key: "created_by",
        width: 20,
      },
    ];

    worksheet.getColumn("transaction_date").numFmt = "dd mmm yyyy hh:mm";

    transactions.forEach((transaction: any) => {
      worksheet.addRow({
        transaction_date: formatDate(transaction.transaction_date),
        name: transaction.name,
        barcode: transaction.barcode,
        quantity: transaction.quantity,
        transaction_type: transaction.transaction_type,
        created_by: transaction.created_by,
      });
    });

    // Make header bold
    worksheet.getRow(1).font = {
      bold: true,
    };

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        }).format(date);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="transactions.xlsx"',
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);

    return NextResponse.json(
      { message: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}