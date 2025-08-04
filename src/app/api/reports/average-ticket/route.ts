import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { subMonths, startOfMonth } from "date-fns"

interface AverageTicket {
  period: string
  total_sales: number
  invoice_count: number
  average_ticket: number
  median_ticket: number
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
      WITH invoice_data AS (
        SELECT 
          to_char(invoice_date, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          CASE 
            WHEN type = 'out_invoice' THEN amount_total_signed
            WHEN type = 'out_refund' THEN -ABS(amount_total_signed)
            ELSE 0
          END AS invoice_amount
        FROM account_move
        WHERE type IN ('out_invoice', 'out_refund')
          AND state = 'posted'
          AND invoice_date >= $2
      ),
      period_stats AS (
        SELECT 
          period,
          SUM(invoice_amount) AS total_sales,
          COUNT(CASE WHEN invoice_amount > 0 THEN 1 END) AS invoice_count,
          AVG(CASE WHEN invoice_amount > 0 THEN invoice_amount END) AS average_ticket,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY invoice_amount) 
            FILTER (WHERE invoice_amount > 0) AS median_ticket
        FROM invoice_data
        GROUP BY period
      )
      SELECT 
        period,
        COALESCE(total_sales, 0) AS total_sales,
        COALESCE(invoice_count, 0) AS invoice_count,
        COALESCE(average_ticket, 0) AS average_ticket,
        COALESCE(median_ticket, 0) AS median_ticket
      FROM period_stats
      WHERE period IS NOT NULL
      ORDER BY period ASC;
    `, [range, fromStr])

    const data: AverageTicket[] = result.rows.map(row => ({
      period: row.period,
      total_sales: parseFloat(row.total_sales) || 0,
      invoice_count: parseInt(row.invoice_count) || 0,
      average_ticket: parseFloat(row.average_ticket) || 0,
      median_ticket: parseFloat(row.median_ticket) || 0
    }))

    // Debug info
    console.log(`Average ticket data for range ${range}:`)
    console.log("Total periods:", data.length)
    
    if (data.length > 0) {
      const avgTicketOverall = data.reduce((sum, d) => sum + d.average_ticket, 0) / data.length
      console.log("Overall average ticket:", avgTicketOverall.toFixed(2))
    }

    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error("Error fetching average ticket:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener ticket promedio" },
      { status: 500 }
    )
  }
}