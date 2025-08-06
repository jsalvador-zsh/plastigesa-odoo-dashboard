// src/services/purchasesService.ts
import db from "@/lib/db"
import type { QueryResult } from "pg"
import type { TimeRange, LatestPurchase } from "@/types/purchases"

export class PurchasesService {
  // Obtener condición de fecha según el rango
  static getDateCondition(range: TimeRange): string {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    switch (range) {
      case "month":
        return `EXTRACT(MONTH FROM am.invoice_date) = ${currentMonth} 
                AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
        
      case "quarter":
        const currentQuarter = Math.ceil(currentMonth / 3)
        const quarterStartMonth = (currentQuarter - 1) * 3 + 1
        const quarterEndMonth = currentQuarter * 3
        
        return `EXTRACT(MONTH FROM am.invoice_date) BETWEEN ${quarterStartMonth} AND ${quarterEndMonth}
                AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
        
      case "year":
        return `EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
        
      default:
        return `EXTRACT(MONTH FROM am.invoice_date) = ${currentMonth} 
                AND EXTRACT(YEAR FROM am.invoice_date) = ${currentYear}`
    }
  }

  // Obtener últimas compras
  static async getLatestPurchases(range: TimeRange, limit: number): Promise<LatestPurchase[]> {
    const dateCondition = this.getDateCondition(range)
    
    const query = `
      SELECT 
        rp.name AS customer_name,
        am.name AS invoice_number,
        am.invoice_date,
        am.amount_total_signed,
        am.type AS invoice_type,
        am.state
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
        AND ${dateCondition}
      ORDER BY am.invoice_date DESC, am.id DESC
      LIMIT $1
    `

    const result: QueryResult<LatestPurchase> = await db.query(query, [limit])
    return result.rows
  }

  // Versión alternativa: últimas compras sin filtro de período (para mostrar las más recientes)
  static async getRecentPurchases(limit: number): Promise<LatestPurchase[]> {
    const query = `
      SELECT 
        rp.name AS customer_name,
        am.name AS invoice_number,
        am.invoice_date,
        am.amount_total_signed,
        am.type AS invoice_type,
        am.state
      FROM account_move am
      JOIN res_partner rp ON am.partner_id = rp.id
      WHERE am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
        AND am.invoice_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY am.invoice_date DESC, am.id DESC
      LIMIT $1
    `

    const result: QueryResult<LatestPurchase> = await db.query(query, [limit])
    return result.rows
  }
}