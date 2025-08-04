import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET() {
  try {
    // Obtener el total de clientes (sin filtro de tiempo)
    const totalCustomersResult = await db.query(
      `SELECT COUNT(DISTINCT id) AS total FROM res_partner`
    )
    const totalCustomers = parseInt(totalCustomersResult.rows[0].total, 10)

    // Obtener el total de clientes del mes anterior para calcular el cambio
    const lastMonthCustomersResult = await db.query(
      `SELECT COUNT(DISTINCT partner_id) AS count 
       FROM account_move 
       WHERE type = 'out_invoice' 
         AND state = 'posted'
         AND invoice_date >= CURRENT_DATE - INTERVAL '2 months'
         AND invoice_date < CURRENT_DATE - INTERVAL '1 month'`
    )
    const lastMonthCustomers = parseInt(lastMonthCustomersResult.rows[0].count, 10)

    // Obtener el total de clientes del mes actual
    const currentMonthCustomersResult = await db.query(
      `SELECT COUNT(DISTINCT partner_id) AS count 
       FROM account_move 
       WHERE type = 'out_invoice' 
         AND state = 'posted'
         AND invoice_date >= CURRENT_DATE - INTERVAL '1 month'`
    )
    const currentMonthCustomers = parseInt(currentMonthCustomersResult.rows[0].count, 10)

    // Calcular cambios porcentuales
    const totalCustomersChange = calculatePercentageChange(
      lastMonthCustomers, 
      currentMonthCustomers
    )

    // Obtener estadísticas del cliente top
    const topCustomerResult = await db.query(
      `SELECT 
         rp.name AS customer_name,
         SUM(am.amount_total_signed) AS total_purchased
       FROM account_move am
       JOIN res_partner rp ON am.partner_id = rp.id
       WHERE am.type = 'out_invoice'
         AND am.state = 'posted'
         AND am.invoice_date >= CURRENT_DATE - INTERVAL '1 month'
       GROUP BY rp.name
       ORDER BY total_purchased DESC
       LIMIT 1`
    )

    const topCustomer = topCustomerResult.rows[0] || {
      customer_name: "N/A",
      total_purchased: 0
    }

    // Obtener ticket promedio
    const avgTicketResult = await db.query(
      `SELECT 
         AVG(amount_total_signed) AS avg_ticket,
         COUNT(id) AS invoice_count
       FROM account_move
       WHERE type = 'out_invoice'
         AND state = 'posted'
         AND invoice_date >= CURRENT_DATE - INTERVAL '1 month'`
    )

    const avgTicket = parseFloat(avgTicketResult.rows[0].avg_ticket) || 0
    const invoiceCount = parseInt(avgTicketResult.rows[0].invoice_count, 10)

    // Obtener nuevos clientes (primer compra en últimos 15 días)
    const newCustomersResult = await db.query(
      `SELECT COUNT(DISTINCT partner_id) AS count
       FROM account_move
       WHERE type = 'out_invoice'
         AND state = 'posted'
         AND invoice_date >= CURRENT_DATE - INTERVAL '15 days'
         AND partner_id NOT IN (
           SELECT DISTINCT partner_id 
           FROM account_move 
           WHERE invoice_date < CURRENT_DATE - INTERVAL '15 days'
             AND type = 'out_invoice'
         )`
    )
    const newCustomers = parseInt(newCustomersResult.rows[0].count, 10)

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalCustomersChange,
        topCustomer: {
          name: topCustomer.customer_name,
          amount: topCustomer.total_purchased
        },
        avgTicket,
        newCustomers,
        invoiceCount
      }
    })
  } catch (error) {
    console.error("Error fetching customer stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener las estadísticas" },
      { status: 500 }
    )
  }
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}