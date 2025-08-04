import { NextResponse } from "next/server"
import db from "@/lib/db"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns"

export async function GET() {
  try {
    const now = new Date()
    const startThisMonth = startOfMonth(now)
    const endThisMonth = endOfMonth(now)
    const startLastMonth = startOfMonth(subMonths(now, 1))
    const endLastMonth = endOfMonth(subMonths(now, 1))

    // Obtener total de vendedores activos (usuarios que han hecho ventas este mes)
    const totalSalesmenResult = await db.query(
      `SELECT COUNT(DISTINCT am.invoice_user_id) AS total 
       FROM account_move am
       WHERE am.type = 'out_invoice'
         AND am.state = 'posted'
         AND am.invoice_date BETWEEN $1 AND $2
         AND am.invoice_user_id IS NOT NULL`,
      [startThisMonth, endThisMonth]
    )
    const totalSalesmen = parseInt(totalSalesmenResult.rows[0].total, 10)

    // Ventas totales del mes actual (facturas - notas de crédito)
    const currentMonthSalesResult = await db.query(
      `SELECT 
         SUM(CASE 
           WHEN type = 'out_invoice' THEN amount_total_signed 
           WHEN type = 'out_refund' THEN -amount_total_signed 
           ELSE 0 
         END) AS total_sales,
         COUNT(DISTINCT CASE WHEN type = 'out_invoice' THEN id END) AS total_invoices,
         COUNT(DISTINCT CASE WHEN type = 'out_invoice' THEN partner_id END) AS customers_served
       FROM account_move
       WHERE type IN ('out_invoice', 'out_refund')
         AND state = 'posted'
         AND invoice_date BETWEEN $1 AND $2`,
      [startThisMonth, endThisMonth]
    )
    const currentMonthSales = parseFloat(currentMonthSalesResult.rows[0].total_sales) || 0
    const currentMonthInvoices = parseInt(currentMonthSalesResult.rows[0].total_invoices, 10)
    const currentMonthCustomers = parseInt(currentMonthSalesResult.rows[0].customers_served, 10)

    // Ventas del mes anterior para comparación (facturas - notas de crédito)
    const lastMonthSalesResult = await db.query(
      `SELECT SUM(CASE 
         WHEN type = 'out_invoice' THEN amount_total_signed 
         WHEN type = 'out_refund' THEN -amount_total_signed 
         ELSE 0 
       END) AS total_sales
       FROM account_move
       WHERE type IN ('out_invoice', 'out_refund')
         AND state = 'posted'
         AND invoice_date BETWEEN $1 AND $2`,
      [startLastMonth, endLastMonth]
    )
    const lastMonthSales = parseFloat(lastMonthSalesResult.rows[0].total_sales) || 0

    // Top vendedor del mes (con ingresos reales)
    const topSalesmanResult = await db.query(
      `SELECT 
         COALESCE(rp.name, ru.login, 'Usuario ' || am.invoice_user_id) AS salesman_name,
         SUM(CASE 
           WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
           WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
           ELSE 0 
         END) AS total_sales,
         COUNT(CASE WHEN am.type = 'out_invoice' THEN am.id END) AS invoices_count,
         COUNT(DISTINCT CASE WHEN am.type = 'out_invoice' THEN am.partner_id END) AS customers_count
       FROM account_move am
       LEFT JOIN res_users ru ON am.invoice_user_id = ru.id
       LEFT JOIN res_partner rp ON ru.partner_id = rp.id
       WHERE am.type IN ('out_invoice', 'out_refund')
         AND am.state = 'posted'
         AND am.invoice_date BETWEEN $1 AND $2
         AND am.invoice_user_id IS NOT NULL
       GROUP BY am.invoice_user_id, rp.name, ru.login
       HAVING SUM(CASE 
         WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
         WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
         ELSE 0 
       END) > 0
       ORDER BY total_sales DESC
       LIMIT 1`,
      [startThisMonth, endThisMonth]
    )
    const topSalesman = topSalesmanResult.rows[0] || {
      salesman_name: "N/A",
      total_sales: 0,
      invoices_count: 0,
      customers_count: 0
    }

    // Promedio de ventas por vendedor (ingresos reales)
    const avgSalesPerSalesmanResult = await db.query(
      `SELECT AVG(salesman_sales.total_sales) AS avg_sales
       FROM (
         SELECT 
           am.invoice_user_id,
           SUM(CASE 
             WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
             WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
             ELSE 0 
           END) AS total_sales
         FROM account_move am
         WHERE am.type IN ('out_invoice', 'out_refund')
           AND am.state = 'posted'
           AND am.invoice_date BETWEEN $1 AND $2
           AND am.invoice_user_id IS NOT NULL
         GROUP BY am.invoice_user_id
         HAVING SUM(CASE 
           WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
           WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
           ELSE 0 
         END) > 0
       ) AS salesman_sales`,
      [startThisMonth, endThisMonth]
    )
    const avgSalesPerSalesman = parseFloat(avgSalesPerSalesmanResult.rows[0].avg_sales) || 0

    // Ranking de vendedores (top 5) con ingresos reales
    const salesmenRankingResult = await db.query(
      `SELECT 
         COALESCE(rp.name, ru.login, 'Usuario ' || am.invoice_user_id) AS salesman_name,
         SUM(CASE 
           WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
           WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
           ELSE 0 
         END) AS total_sales,
         COUNT(CASE WHEN am.type = 'out_invoice' THEN am.id END) AS invoices_count,
         COUNT(DISTINCT CASE WHEN am.type = 'out_invoice' THEN am.partner_id END) AS customers_count,
         AVG(CASE WHEN am.type = 'out_invoice' THEN am.amount_total_signed END) AS avg_ticket
       FROM account_move am
       LEFT JOIN res_users ru ON am.invoice_user_id = ru.id
       LEFT JOIN res_partner rp ON ru.partner_id = rp.id
       WHERE am.type IN ('out_invoice', 'out_refund')
         AND am.state = 'posted'
         AND am.invoice_date BETWEEN $1 AND $2
         AND am.invoice_user_id IS NOT NULL
       GROUP BY am.invoice_user_id, rp.name, ru.login
       HAVING SUM(CASE 
         WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
         WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
         ELSE 0 
       END) > 0
       ORDER BY total_sales DESC
       LIMIT 5`,
      [startThisMonth, endThisMonth]
    )

    // Objetivos vs Resultados con ingresos reales
    const salesTargetResult = await db.query(
      `SELECT 
         COALESCE(rp.name, ru.login, 'Usuario ' || am.invoice_user_id) AS salesman_name,
         0 AS target,  -- Por ahora sin objetivos definidos
         SUM(CASE 
           WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
           WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
           ELSE 0 
         END) AS achieved
       FROM account_move am
       LEFT JOIN res_users ru ON am.invoice_user_id = ru.id
       LEFT JOIN res_partner rp ON ru.partner_id = rp.id
       WHERE am.type IN ('out_invoice', 'out_refund')
         AND am.state = 'posted'
         AND am.invoice_date BETWEEN $1 AND $2
         AND am.invoice_user_id IS NOT NULL
       GROUP BY am.invoice_user_id, rp.name, ru.login
       HAVING SUM(CASE 
         WHEN am.type = 'out_invoice' THEN am.amount_total_signed 
         WHEN am.type = 'out_refund' THEN -am.amount_total_signed 
         ELSE 0 
       END) > 0
       ORDER BY achieved DESC`,
      [startThisMonth, endThisMonth]
    )

    // Conversión de leads a ventas (solo considerando facturas)
    const conversionRateResult = await db.query(
      `SELECT 
         COALESCE(rp.name, ru.login, 'Usuario ' || am.invoice_user_id) AS salesman_name,
         COUNT(DISTINCT am.partner_id) AS won_leads,  -- Clientes únicos como proxy
         COUNT(am.id) AS total_leads,  -- Total de facturas como proxy
         ROUND(
           COUNT(DISTINCT am.partner_id) * 100.0 / 
           NULLIF(COUNT(am.id), 0), 2
         ) AS conversion_rate
       FROM account_move am
       LEFT JOIN res_users ru ON am.invoice_user_id = ru.id
       LEFT JOIN res_partner rp ON ru.partner_id = rp.id
       WHERE am.type = 'out_invoice'
         AND am.state = 'posted'
         AND am.invoice_date BETWEEN $1 AND $2
         AND am.invoice_user_id IS NOT NULL
       GROUP BY am.invoice_user_id, rp.name, ru.login
       ORDER BY conversion_rate DESC NULLS LAST`,
      [startThisMonth, endThisMonth]
    )

    // Cálculo de cambios porcentuales
    const salesChange = calculatePercentageChange(lastMonthSales, currentMonthSales)

    return NextResponse.json({
      success: true,
      data: {
        // KPIs principales
        totalSalesmen,
        currentMonthSales,
        salesChange,
        currentMonthInvoices,
        currentMonthCustomers,
        avgSalesPerSalesman,
        month: format(startThisMonth, "MMMM yyyy"),
        
        // Top performer
        topSalesman: {
          name: topSalesman.salesman_name,
          sales: parseFloat(topSalesman.total_sales),
          invoices: parseInt(topSalesman.invoices_count),
          customers: parseInt(topSalesman.customers_count)
        },
        
        // Rankings y comparaciones
        salesmenRanking: salesmenRankingResult.rows.map(row => ({
          name: row.salesman_name,
          sales: parseFloat(row.total_sales),
          invoices: parseInt(row.invoices_count),
          customers: parseInt(row.customers_count),
          avgTicket: parseFloat(row.avg_ticket) || 0
        })),
        
        // Objetivos vs resultados
        targetsVsResults: salesTargetResult.rows.map(row => ({
          name: row.salesman_name,
          target: parseFloat(row.target) || 0,
          achieved: parseFloat(row.achieved) || 0,
          percentage: row.target > 0 ? ((parseFloat(row.achieved) / parseFloat(row.target)) * 100).toFixed(1) : 0
        })),
        
        // Tasas de conversión
        conversionRates: conversionRateResult.rows.map(row => ({
          name: row.salesman_name,
          wonLeads: parseInt(row.won_leads),
          totalLeads: parseInt(row.total_leads),
          conversionRate: parseFloat(row.conversion_rate) || 0
        }))
      }
    })
  } catch (error) {
    console.error("Error fetching sales team stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener las estadísticas del equipo de ventas" },
      { status: 500 }
    )
  }
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}