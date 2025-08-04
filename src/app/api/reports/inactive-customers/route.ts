import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const offset = (page - 1) * limit
  const all = searchParams.get("all") === "true"

  try {
    // Total sin paginar
    const totalResult = await db.query(`
      SELECT COUNT(*) AS total
      FROM (
        SELECT rp.id
        FROM res_partner rp
        JOIN account_move am ON am.partner_id = rp.id
        WHERE am.type = 'out_invoice'
          AND am.state = 'posted'
        GROUP BY rp.id
        HAVING MAX(am.invoice_date) <= CURRENT_DATE - INTERVAL '3 months'
      ) AS sub
    `)

    const total = parseInt(totalResult.rows[0].total, 10)
    const totalPages = Math.ceil(total / limit)

    const baseQuery = `
      SELECT
        rp.name AS customer_name,
        COUNT(am.id) AS invoice_count,
        SUM(am.amount_total_signed) AS total_purchased,
        MAX(am.invoice_date) AS last_purchase
      FROM res_partner rp
      JOIN account_move am ON am.partner_id = rp.id
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
      GROUP BY rp.id, rp.name
      HAVING MAX(am.invoice_date) <= CURRENT_DATE - INTERVAL '3 months'
      ORDER BY last_purchase ASC
    `

    const result = all
      ? await db.query(baseQuery)
      : await db.query(`${baseQuery} OFFSET $1 LIMIT $2`, [offset, limit])

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: all
        ? undefined
        : {
            total,
            totalPages,
            currentPage: page,
            perPage: limit,
          },
    })
  } catch (error) {
    console.error("Error fetching inactive customers:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener clientes inactivos" },
      { status: 500 }
    )
  }
}
