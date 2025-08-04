import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { subMonths, startOfMonth } from "date-fns"

interface SalesVsQuotes {
  period: string
  type: "quote" | "invoice"
  total: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") || "month" // 'month' | 'quarter' | 'year'
    
    // Ajusta el número de periodos según el rango
    const periodCount = range === "year" ? 12 : range === "quarter" ? 6 : 6
    const dateFrom = subMonths(new Date(), periodCount)
    const fromStr = startOfMonth(dateFrom).toISOString().split("T")[0]
    
    const result = await db.query(`
      WITH invoices_gross AS (
        SELECT 
          to_char(invoice_date, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          SUM(amount_total_signed) AS invoice_total,
          0 AS refund_total
        FROM account_move
        WHERE type = 'out_invoice'
          AND state = 'posted'
          AND invoice_date >= $2
        GROUP BY period
      ),
      refunds AS (
        SELECT 
          to_char(invoice_date, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          0 AS invoice_total,
          SUM(ABS(amount_total_signed)) AS refund_total
        FROM account_move
        WHERE type = 'out_refund'
          AND state = 'posted'
          AND invoice_date >= $2
        GROUP BY period
      ),
      invoices AS (
        SELECT 
          period,
          'invoice' AS type,
          SUM(invoice_total - refund_total) AS total
        FROM (
          SELECT * FROM invoices_gross
          UNION ALL
          SELECT * FROM refunds
        ) combined_invoices
        GROUP BY period
      ),
      quotes AS (
        SELECT 
          to_char(date_order, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          'quote' AS type,
          SUM(amount_total_mn) AS total
        FROM sale_order
        WHERE date_order >= $2
        GROUP BY period
      )
      SELECT 
        period,
        type,
        COALESCE(total, 0) AS total
      FROM (
        SELECT * FROM invoices
        UNION ALL
        SELECT * FROM quotes
      ) combined
      WHERE period IS NOT NULL
      ORDER BY period ASC, type ASC;
    `, [range, fromStr])

    const data: SalesVsQuotes[] = result.rows.map(row => ({
      period: row.period,
      type: row.type,
      total: parseFloat(row.total) || 0
    }))

    // Debug info para verificar los cálculos
    console.log(`Sales vs Quotes data for range ${range}:`)
    console.log("Sample periods:", data.slice(0, 6))
    
    // Mostrar totales por tipo para debug
    const invoiceTotals = data.filter(d => d.type === 'invoice').reduce((sum, d) => sum + d.total, 0)
    const quoteTotals = data.filter(d => d.type === 'quote').reduce((sum, d) => sum + d.total, 0)
    console.log(`Total invoices (net): ${invoiceTotals}, Total quotes: ${quoteTotals}`)

    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error("Error fetching sales vs quotes:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener ventas vs cotizaciones" },
      { status: 500 }
    )
  }
}