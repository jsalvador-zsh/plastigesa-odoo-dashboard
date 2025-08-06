// src/services/statsService.ts
import db from "@/lib/db"
import type { QueryResult } from "pg"
import type { TimeRange } from "@/types/dashboard"

export class StatsService {
  // Obtener condiciones de fecha para período actual y anterior
  static getDateConditions(range: TimeRange): { current: string; previous: string } {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    switch (range) {
      case "month":
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
        const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear
        
        return {
          current: `EXTRACT(MONTH FROM am.invoice_date) = ${currentMonth} 
                   AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`,
          previous: `EXTRACT(MONTH FROM am.invoice_date) = ${previousMonth} 
                    AND EXTRACT(YEAR FROM am.invoice_date) = ${previousYear}`
        }
        
      case "quarter":
        const currentQuarter = Math.ceil(currentMonth / 3)
        const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1
        const quarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear
        
        const currentQuarterStart = (currentQuarter - 1) * 3 + 1
        const currentQuarterEnd = currentQuarter * 3
        const previousQuarterStart = (previousQuarter - 1) * 3 + 1
        const previousQuarterEnd = previousQuarter * 3
        
        return {
          current: `EXTRACT(MONTH FROM am.invoice_date) BETWEEN ${currentQuarterStart} AND ${currentQuarterEnd}
                   AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`,
          previous: `EXTRACT(MONTH FROM am.invoice_date) BETWEEN ${previousQuarterStart} AND ${previousQuarterEnd}
                    AND EXTRACT(YEAR FROM am.invoice_date) = ${quarterYear}`
        }
        
      case "year":
        return {
          current: `EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`,
          previous: `EXTRACT(YEAR FROM am.invoice_date) = ${currentYear - 1}`
        }
        
      default:
        return this.getDateConditions("month")
    }
  }

  // Obtener total de clientes activos
  static async getTotalActiveCustomers(): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT partner_id) AS total 
      FROM account_move 
      WHERE type = 'out_invoice' 
        AND state = 'posted'
    `
    const result = await db.query(query)
    return parseInt(result.rows[0].total, 10)
  }

  // Obtener clientes del período
  static async getCustomersByPeriod(dateCondition: string): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT partner_id) AS count
      FROM account_move am
      WHERE type = 'out_invoice'
        AND state = 'posted'
        AND ${dateCondition}
    `
    const result = await db.query(query)
    return parseInt(result.rows[0].count, 10)
  }

  // Obtener cliente top del período
  static async getTopCustomer(dateCondition: string): Promise<{ name: string; amount: number }> {
    const query = `
      SELECT 
        rp.name AS customer_name,
        COALESCE(SUM(
          CASE 
            WHEN am.type = 'out_invoice' THEN am.amount_total_signed
            WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
            ELSE 0
          END
        ), 0) AS total_purchased
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
        AND ${dateCondition}
      GROUP BY rp.id, rp.name
      HAVING COALESCE(SUM(
        CASE 
          WHEN am.type = 'out_invoice' THEN am.amount_total_signed
          WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
          ELSE 0
        END
      ), 0) > 0
      ORDER BY total_purchased DESC
      LIMIT 1
    `
    
    const result = await db.query(query)
    const topCustomer = result.rows[0] || { customer_name: "N/A", total_purchased: 0 }
    
    return {
      name: String(topCustomer.customer_name),
      amount: parseFloat(String(topCustomer.total_purchased))
    }
  }

  // Obtener estadísticas de tickets
  static async getTicketStats(dateCondition: string): Promise<{ avgTicket: number; invoiceCount: number }> {
    const query = `
      SELECT 
        AVG(amount_total_signed) AS avg_ticket,
        COUNT(id) AS invoice_count
      FROM account_move am
      WHERE type = 'out_invoice'
        AND state = 'posted'
        AND ${dateCondition}
    `
    
    const result = await db.query(query)
    const row = result.rows[0] || { avg_ticket: 0, invoice_count: 0 }
    
    return {
      avgTicket: parseFloat(String(row.avg_ticket)) || 0,
      invoiceCount: parseInt(String(row.invoice_count), 10)
    }
  }

  // Obtener nuevos clientes (primer compra en el período)
  static async getNewCustomers(dateCondition: string): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT current_customers.partner_id) AS count
      FROM (
        SELECT DISTINCT partner_id
        FROM account_move am
        WHERE type = 'out_invoice'
          AND state = 'posted'
          AND ${dateCondition}
      ) current_customers
      LEFT JOIN (
        SELECT DISTINCT partner_id
        FROM account_move am
        WHERE type = 'out_invoice'
          AND state = 'posted'
          AND NOT (${dateCondition})
      ) previous_customers ON current_customers.partner_id = previous_customers.partner_id
      WHERE previous_customers.partner_id IS NULL
    `
    
    const result = await db.query(query)
    return parseInt(result.rows[0].count, 10)
  }

  // Calcular cambio porcentual
  static calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Obtener descripción del período
  static getPeriodDescription(range: TimeRange): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    switch (range) {
      case "month":
        return `${monthNames[currentMonth - 1]} ${currentYear}`
        
      case "quarter":
        const currentQuarter = Math.ceil(currentMonth / 3)
        const quarterNames = {
          1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"
        }
        return `${quarterNames[currentQuarter as keyof typeof quarterNames]} ${currentYear}`
        
      case "year":
        return `${currentYear}`
        
      default:
        return `${monthNames[currentMonth - 1]} ${currentYear}`
    }
  }
}