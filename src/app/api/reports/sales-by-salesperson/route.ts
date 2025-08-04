import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { subMonths, startOfMonth } from "date-fns"

interface SalesBySalesperson {
  period: string
  salesperson_id: number
  salesperson_name: string
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
      WITH sales_data AS (
        SELECT 
          to_char(am.invoice_date, CASE 
            WHEN $1 = 'month' THEN 'YYYY-MM'
            WHEN $1 = 'quarter' THEN 'YYYY-"Q"Q'
            ELSE 'YYYY'
          END) AS period,
          COALESCE(am.invoice_user_id, so.user_id) AS salesperson_id,
          COALESCE(
            p1.name, 
            p2.name,
            u1.login,
            u2.login,
            'Sin Asignar'
          ) AS salesperson_name,
          SUM(
            CASE 
              WHEN am.type = 'out_invoice' THEN am.amount_total_signed
              WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
              ELSE 0
            END
          ) AS total
        FROM account_move am
        LEFT JOIN sale_order so ON so.name = am.invoice_origin
        LEFT JOIN res_users u1 ON u1.id = am.invoice_user_id
        LEFT JOIN res_users u2 ON u2.id = so.user_id
        LEFT JOIN res_partner p1 ON p1.id = u1.partner_id
        LEFT JOIN res_partner p2 ON p2.id = u2.partner_id
        WHERE am.type IN ('out_invoice', 'out_refund')
          AND am.state = 'posted'
          AND am.invoice_date >= $2
        GROUP BY period, salesperson_id, salesperson_name
      )
      SELECT 
        period,
        salesperson_id,
        salesperson_name,
        COALESCE(total, 0) AS total
      FROM sales_data
      WHERE period IS NOT NULL
        AND total != 0
      ORDER BY period ASC, total DESC;
    `, [range, fromStr])

    const data: SalesBySalesperson[] = result.rows.map(row => ({
      period: row.period,
      salesperson_id: parseInt(row.salesperson_id) || 0,
      salesperson_name: row.salesperson_name || 'Sin Asignar',
      total: parseFloat(row.total) || 0
    }))

    // Debug info
    console.log(`Sales by salesperson data for range ${range}:`)
    console.log("Total records:", data.length)
    
    // Mostrar vendedores únicos
    const uniqueSalespeople = [...new Set(data.map(d => d.salesperson_name))]
    console.log("Unique salespeople:", uniqueSalespeople)
    
    // Totales por vendedor para debug
    const totalsBySalesperson = data.reduce((acc, curr) => {
      acc[curr.salesperson_name] = (acc[curr.salesperson_name] || 0) + curr.total
      return acc
    }, {} as Record<string, number>)
    console.log("Totals by salesperson:", totalsBySalesperson)

    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error("Error fetching sales by salesperson:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener ventas por vendedor" },
      { status: 500 }
    )
  }
}