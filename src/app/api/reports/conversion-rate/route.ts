import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { subMonths, startOfMonth } from "date-fns"

interface ConversionRate {
  period: string
  quotes_count: number
  quotes_total: number
  invoices_count: number
  invoices_total: number
  conversion_rate_count: number
  conversion_rate_value: number
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
      WITH quotes_data AS (
        SELECT 
          to_char(date_order, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          COUNT(*) AS quotes_count,
          SUM(amount_total_mn) AS quotes_total
        FROM sale_order
        WHERE date_order >= $2
          AND state IN ('sent', 'draft', 'sale', 'done')
        GROUP BY period
      ),
      invoices_data AS (
        SELECT 
          to_char(invoice_date, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          COUNT(CASE WHEN type = 'out_invoice' THEN 1 END) AS invoices_count,
          SUM(
            CASE 
              WHEN type = 'out_invoice' THEN amount_total_signed
              WHEN type = 'out_refund' THEN -ABS(amount_total_signed)
              ELSE 0
            END
          ) AS invoices_total
        FROM account_move
        WHERE type IN ('out_invoice', 'out_refund')
          AND state = 'posted'
          AND invoice_date >= $2
        GROUP BY period
      ),
      conversion_data AS (
        SELECT 
          COALESCE(q.period, i.period) AS period,
          COALESCE(q.quotes_count, 0) AS quotes_count,
          COALESCE(q.quotes_total, 0) AS quotes_total,
          COALESCE(i.invoices_count, 0) AS invoices_count,
          COALESCE(i.invoices_total, 0) AS invoices_total
        FROM quotes_data q
        FULL OUTER JOIN invoices_data i ON q.period = i.period
      )
      SELECT 
        period,
        quotes_count,
        quotes_total,
        invoices_count,
        invoices_total,
        CASE 
          WHEN quotes_count > 0 THEN 
            ROUND((invoices_count::numeric / quotes_count::numeric) * 100, 2)
          ELSE 0 
        END AS conversion_rate_count,
        CASE 
          WHEN quotes_total > 0 THEN 
            ROUND((invoices_total::numeric / quotes_total::numeric) * 100, 2)
          ELSE 0 
        END AS conversion_rate_value
      FROM conversion_data
      WHERE period IS NOT NULL
      ORDER BY period ASC;
    `, [range, fromStr])

    const data: ConversionRate[] = result.rows.map(row => ({
      period: row.period,
      quotes_count: parseInt(row.quotes_count) || 0,
      quotes_total: parseFloat(row.quotes_total) || 0,
      invoices_count: parseInt(row.invoices_count) || 0,
      invoices_total: parseFloat(row.invoices_total) || 0,
      conversion_rate_count: parseFloat(row.conversion_rate_count) || 0,
      conversion_rate_value: parseFloat(row.conversion_rate_value) || 0
    }))

    // Debug info
    console.log(`Conversion rate data for range ${range}:`)
    console.log("Total periods:", data.length)
    
    if (data.length > 0) {
      const avgConversionRate = data.reduce((sum, d) => sum + d.conversion_rate_count, 0) / data.length
      console.log("Average conversion rate:", avgConversionRate.toFixed(2) + "%")
    }

    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error("Error fetching conversion rate:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener tasa de conversión" },
      { status: 500 }
    )
  }
}