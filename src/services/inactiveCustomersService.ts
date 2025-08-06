// src/services/inactiveCustomersService.ts
import db from "@/lib/db"
import type { QueryResult } from "pg"
import type { InactiveCustomer, InactivityPeriod } from "@/types/inactive"

export class InactiveCustomersService {
  // Convertir período a intervalo SQL
  static getInactivityInterval(period: InactivityPeriod): string {
    const intervals = {
      "3_months": "3 months",
      "6_months": "6 months", 
      "1_year": "1 year"
    }
    return intervals[period] || intervals["3_months"]
  }

  // Obtener descripción del período
  static getPeriodDescription(period: InactivityPeriod): string {
    const descriptions = {
      "3_months": "3 meses",
      "6_months": "6 meses",
      "1_year": "1 año"
    }
    return descriptions[period] || descriptions["3_months"]
  }

  // Obtener total de clientes inactivos
  static async getTotalInactiveCustomers(period: InactivityPeriod): Promise<number> {
    const interval = this.getInactivityInterval(period)
    
    const query = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT rp.id
        FROM res_partner rp
        JOIN account_move am ON am.partner_id = rp.id
        WHERE am.type IN ('out_invoice', 'out_refund')
          AND am.state = 'posted'
        GROUP BY rp.id
        HAVING MAX(am.invoice_date) <= CURRENT_DATE - INTERVAL '${interval}'
      ) AS sub
    `
    
    const result = await db.query(query)
    return parseInt(result.rows[0].total, 10)
  }

  // Obtener clientes inactivos con paginación
  static async getInactiveCustomers(
    period: InactivityPeriod,
    page: number,
    limit: number,
    all: boolean = false
  ): Promise<{ data: InactiveCustomer[], meta?: any }> {
    const interval = this.getInactivityInterval(period)
    const offset = (page - 1) * limit

    const baseQuery = `
      SELECT
        rp.name AS customer_name,
        rp.phone AS phone,
        rp.mobile AS mobile,
        rp.email AS email,
        COUNT(CASE WHEN am.type = 'out_invoice' THEN am.id END) AS invoice_count,
        COALESCE(SUM(
          CASE 
            WHEN am.type = 'out_invoice' THEN am.amount_total_signed
            WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
            ELSE 0
          END
        ), 0) AS total_purchased,
        MAX(am.invoice_date) AS last_purchase,
        (CURRENT_DATE - MAX(am.invoice_date)) AS days_since_last_purchase
      FROM res_partner rp
      JOIN account_move am ON am.partner_id = rp.id
      WHERE am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
      GROUP BY rp.id, rp.name, rp.phone, rp.mobile, rp.email
      HAVING MAX(am.invoice_date) <= CURRENT_DATE - INTERVAL '${interval}'
        AND COALESCE(SUM(
          CASE 
            WHEN am.type = 'out_invoice' THEN am.amount_total_signed
            WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
            ELSE 0
          END
        ), 0) > 0
      ORDER BY last_purchase ASC
    `

    let result: QueryResult<InactiveCustomer>
    let total = 0
    
    if (all) {
      result = await db.query(baseQuery)
    } else {
      // Obtener total para paginación
      total = await this.getTotalInactiveCustomers(period)
      
      // Obtener datos paginados
      result = await db.query(`${baseQuery} OFFSET $1 LIMIT $2`, [offset, limit])
    }

    // Procesar datos
    const processedData = result.rows.map(row => {
      console.log("Raw row data:", row) // Debug temporal
      
      return {
        customer_name: String(row.customer_name || ''),
        invoice_count: parseInt(String(row.invoice_count) || '0', 10),
        total_purchased: parseFloat(String(row.total_purchased) || '0'),
        last_purchase: String(row.last_purchase || ''),
        days_since_last_purchase: parseInt(String(row.days_since_last_purchase) || '0', 10),
        phone: row.phone ? String(row.phone) : null,
        mobile: row.mobile ? String(row.mobile) : null,
        email: row.email ? String(row.email) : null
      }
    })

    if (all) {
      return { data: processedData }
    }

    const totalPages = Math.ceil(total / limit)
    
    return {
      data: processedData,
      meta: {
        total,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    }
  }
}