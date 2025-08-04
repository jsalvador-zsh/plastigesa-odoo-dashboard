import { NextResponse } from "next/server"
import db from "@/lib/db"

interface LatestPurchase {
  customer_name: string
  invoice_number: string
  invoice_date: string
  amount_total_signed: number
  product_names: string[]
}

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        rp.name AS customer_name,
        am.name AS invoice_number,
        am.invoice_date,
        am.amount_total_signed,
        ARRAY_AGG(pt.name) AS product_names
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      JOIN account_move_line aml ON am.id = aml.move_id
      LEFT JOIN product_product pp ON aml.product_id = pp.id
      LEFT JOIN product_template pt ON pp.product_tmpl_id = pt.id
      WHERE am.type = 'out_invoice'
        AND am.state = 'posted'
        AND am.invoice_date >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY rp.name, am.name, am.invoice_date, am.amount_total_signed
      ORDER BY am.invoice_date DESC
      LIMIT 10
    `)

    const latestPurchases: LatestPurchase[] = result.rows.map(row => ({
      customer_name: row.customer_name,
      invoice_number: row.invoice_number,
      invoice_date: row.invoice_date,
      amount_total_signed: row.amount_total_signed,
      product_names: row.product_names.filter((name:any) => name) // Elimina valores nulos
    }))

    return NextResponse.json({
      success: true,
      data: latestPurchases
    })
  } catch (error) {
    console.error("Error fetching latest purchases:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener las últimas compras" },
      { status: 500 }
    )
  }
}