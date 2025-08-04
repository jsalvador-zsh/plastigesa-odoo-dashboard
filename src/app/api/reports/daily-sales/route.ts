import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  try {
    // Resumen general del día
    const summary = await db.query(`
      SELECT 
        COUNT(DISTINCT am.id) AS total_invoices,
        SUM(am.amount_total_signed) AS total_sales,
        COUNT(DISTINCT am.partner_id) AS total_customers,
        AVG(am.amount_total_signed) AS average_ticket
      FROM account_move am
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
        AND am.invoice_date::date = $1::date
    `, [date])

    // Ventas por hora
    const hourlySales = await db.query(`
      SELECT 
        EXTRACT(HOUR FROM am.create_date) AS hour,
        COUNT(DISTINCT am.id) AS invoice_count,
        SUM(am.amount_total_signed) AS total_amount
      FROM account_move am
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
        AND am.invoice_date::date = $1::date
      GROUP BY EXTRACT(HOUR FROM am.create_date)
      ORDER BY hour
    `, [date])

    // Productos más vendidos
    const topProducts = await db.query(`
      SELECT 
        pt.name AS product_name,
        SUM(aml.quantity) AS total_quantity,
        SUM(aml.price_subtotal) AS total_sales
      FROM account_move_line aml
      JOIN account_move am ON aml.move_id = am.id
      JOIN product_product pp ON aml.product_id = pp.id
      JOIN product_template pt ON pp.product_tmpl_id = pt.id
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
        AND am.invoice_date::date = $1::date
      GROUP BY pt.name
      ORDER BY total_sales DESC
      LIMIT 5
    `, [date])

    return NextResponse.json({
      success: true,
      data: {
        date,
        summary: summary.rows[0],
        hourlySales: hourlySales.rows,
        topProducts: topProducts.rows
      }
    })
  } catch (error) {
    console.error("Error fetching daily sales:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener las ventas diarias" },
      { status: 500 }
    )
  }
}