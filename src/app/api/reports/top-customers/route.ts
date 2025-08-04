import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") || "month"
  const topLimit = parseInt(searchParams.get("limit") || "10", 10) // top 10, 30, 50
  const page = parseInt(searchParams.get("page") || "1", 10)
  const perPage = 10
  const offset = (page - 1) * perPage

  let interval: string
  switch (range) {
    case "month":
      interval = "1 month"
      break
    case "quarter":
      interval = "3 months"
      break
    case "year":
    default:
      interval = "1 year"
      break
  }

  try {
    // Obtener el top N completo
    const allResult = await db.query(
      `
      SELECT
        rp.name AS customer_name,
        COUNT(am.id) AS invoice_count,
        SUM(am.amount_total_signed) AS total_purchased,
        MAX(am.invoice_date) AS last_purchase
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
        AND am.invoice_date >= CURRENT_DATE - INTERVAL '${interval}'
      GROUP BY rp.name
      ORDER BY total_purchased DESC
      LIMIT $1
      `,
      [topLimit]
    )

    const allRows = allResult.rows
    const paginated = allRows.slice(offset, offset + perPage)
    const totalPages = Math.ceil(allRows.length / perPage)

    return NextResponse.json({
      success: true,
      data: paginated,
      meta: {
        totalCustomers: allRows.length,
        totalPages,
        currentPage: page,
        perPage,
      },
    })
  } catch (error) {
    console.error("Error fetching top customers:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener los datos" },
      { status: 500 }
    )
  }
}
