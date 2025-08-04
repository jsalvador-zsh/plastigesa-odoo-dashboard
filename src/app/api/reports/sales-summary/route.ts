import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns"

export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    const startThisMonth = startOfMonth(now)
    const endThisMonth = endOfMonth(now)
    const startLastMonth = startOfMonth(subMonths(now, 1))
    const endLastMonth = endOfMonth(subMonths(now, 1))

    // Total ventas del mes actual
    const currentMonthResult = await db.query(`
      SELECT SUM(amount_total_signed) AS total
      FROM account_move
      WHERE type = 'out_invoice'
        AND state = 'posted'
        AND invoice_date BETWEEN $1 AND $2
    `, [startThisMonth, endThisMonth])

    const totalCurrentMonth = parseFloat(currentMonthResult.rows[0]?.total || 0)

    // Total ventas del mes anterior
    const lastMonthResult = await db.query(`
      SELECT SUM(amount_total_signed) AS total
      FROM account_move
      WHERE type = 'out_invoice'
        AND state = 'posted'
        AND invoice_date BETWEEN $1 AND $2
    `, [startLastMonth, endLastMonth])

    const totalLastMonth = parseFloat(lastMonthResult.rows[0]?.total || 0)

    // Crecimiento mensual
    const growthRate = totalLastMonth > 0
      ? ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100
      : 0

    // Ticket promedio del mes actual
    const avgTicketResult = await db.query(`
      SELECT SUM(amount_total_signed) / COUNT(DISTINCT partner_id) AS avg_ticket
      FROM account_move
      WHERE type = 'out_invoice'
        AND state = 'posted'
        AND invoice_date BETWEEN $1 AND $2
    `, [startThisMonth, endThisMonth])

    const avgTicket = parseFloat(avgTicketResult.rows[0]?.avg_ticket || 0)

    // Clientes nuevos del mes (primera factura en este mes)
    const newCustomersResult = await db.query(`
      WITH first_invoices AS (
        SELECT partner_id, MIN(invoice_date) AS first_date
        FROM account_move
        WHERE type = 'out_invoice' AND state = 'posted'
        GROUP BY partner_id
      )
      SELECT COUNT(*) AS new_customers
      FROM first_invoices
      WHERE first_date BETWEEN $1 AND $2
    `, [startThisMonth, endThisMonth])

    const newCustomers = parseInt(newCustomersResult.rows[0]?.new_customers || 0)

    return NextResponse.json({
      success: true,
      data: {
        totalSales: totalCurrentMonth,
        monthlyGrowth: growthRate,
        averageTicket: avgTicket,
        newCustomers,
        month: format(startThisMonth, "MMMM yyyy"),
      },
    })
  } catch (error) {
    console.error("Error en /sales-summary:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener resumen de ventas" },
      { status: 500 }
    )
  }
}
