// app/api/reports/top-customers/route.ts
import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import type { Customer } from "@/types/dashboard"
function getDateCondition(range: string): string {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // getMonth() devuelve 0-11
  switch (range) {
    case "month":
      // Mes actual
      return `EXTRACT(MONTH FROM am.invoice_date) = ${currentMonth} 
              AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
    case "quarter":
      // Trimestre actual
      const currentQuarter = Math.ceil(currentMonth / 3)
      const quarterStartMonth = (currentQuarter - 1) * 3 + 1
      const quarterEndMonth = currentQuarter * 3
      return `EXTRACT(MONTH FROM am.invoice_date) BETWEEN ${quarterStartMonth} AND ${quarterEndMonth}
              AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
    case "year":
      // Año actual
      return `EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
    default:
      return `EXTRACT(MONTH FROM am.invoice_date) = ${currentMonth} 
              AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
  }
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") || "month"
  const topLimit = parseInt(searchParams.get("limit") || "10", 10)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const perPage = 10
  const offset = (page - 1) * perPage
  const dateCondition = getDateCondition(range)
  const journalId = searchParams.get("journal_id") ? parseInt(searchParams.get("journal_id")!, 10) : undefined
  let journalCondition = ""
  if (journalId) {
    journalCondition = `AND am.journal_id = ${journalId}`
  }
  try {
    // Debug query específica para CORPORACIÓN RICO S.A.C.
    const debugQuery = `
      SELECT 
        rp.name AS customer_name,
        am.type,
        am.amount_total_signed,
        am.invoice_date,
        am.id as move_id,
        EXTRACT(MONTH FROM am.invoice_date) as month,
        EXTRACT(YEAR FROM am.invoice_date) as year
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE rp.name = 'CORPORACIÓN RICO S.A.C.'
        AND am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
        AND ${dateCondition}
        ${journalCondition}
      ORDER BY am.invoice_date DESC
    `
    const debugResult = await db.query(debugQuery)
    // Calcular total para verificar
    const debugTotal = debugResult.rows.reduce((sum, row) =>
      sum + parseFloat(row.amount_total_signed), 0
    )
    // Query principal
    const query = `
      SELECT 
        rp.name AS customer_name,
        COUNT(CASE WHEN am.type = 'out_invoice' THEN am.id END) AS invoice_count,
        COUNT(CASE WHEN am.type = 'out_refund' THEN am.id END) AS refund_count,
        COALESCE(SUM(
          CASE 
            WHEN am.type = 'out_invoice' THEN am.amount_total_signed
            WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
            ELSE 0
          END
        ), 0) AS total_purchased,
        MAX(am.invoice_date) AS last_purchase
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
        AND ${dateCondition}
        ${journalCondition}
      GROUP BY rp.id, rp.name
      HAVING COALESCE(SUM(
        CASE 
          WHEN am.type = 'out_invoice' THEN am.amount_total_signed
          WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
          ELSE 0
        END
      ), 0) > 0
      ORDER BY total_purchased DESC
      LIMIT $1
    `
    const allResult = await db.query(query, [topLimit])
    const allRows: Customer[] = allResult.rows.map(row => ({
      customer_name: String(row.customer_name || ''),
      total_purchased: parseFloat(row.total_purchased || '0'),
      invoice_count: parseInt(row.invoice_count || '0', 10),
      refund_count: parseInt(row.refund_count || '0', 10),
      last_purchase: String(row.last_purchase || '')
    }))
    const paginated = allRows.slice(offset, offset + perPage)
    const totalPages = Math.ceil(allRows.length / perPage)
    const response = {
      success: true,
      data: paginated,
      meta: {
        totalCustomers: allRows.length,
        totalPages,
        currentPage: page,
        perPage,
      },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: `Error al obtener los datos: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}