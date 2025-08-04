import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  try {
    // Consulta principal
    const result = await db.query(`
      SELECT 
        am.name AS invoice_number,
        rp.name AS customer_name,
        am.invoice_date,
        am.amount_total_signed,
        am.state,
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'product_name', pt.name,
              'quantity', aml.quantity,
              'price_unit', aml.price_unit,
              'subtotal', aml.price_subtotal
            )
          )
          FROM account_move_line aml
          JOIN product_product pp ON aml.product_id = pp.id
          JOIN product_template pt ON pp.product_tmpl_id = pt.id
          WHERE aml.move_id = am.id
        ) AS items
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
        AND am.invoice_date::date = $1::date
      ORDER BY am.invoice_date DESC
      LIMIT $2 OFFSET $3
    `, [date, limit, offset])

    // Total de registros para paginación
    const countResult = await db.query(`
      SELECT COUNT(*) 
      FROM account_move 
      WHERE type = 'out_invoice'
        AND state = 'posted'
        AND invoice_date::date = $1::date
    `, [date])

    const total = parseInt(countResult.rows[0].count, 10)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    })
  } catch (error) {
    console.error("Error fetching daily sales detail:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener el detalle de ventas" },
      { status: 500 }
    )
  }
}