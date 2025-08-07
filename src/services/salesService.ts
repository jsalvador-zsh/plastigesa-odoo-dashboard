// src/services/salesService.ts
import db from "@/lib/db"
import type { QueryResult } from "pg"
import type { SaleOrder, SalesStats, SalesSummary, SaleOrderState, TimeRange } from "@/types/sales"

export class SalesService {
  // Obtener condición de fecha según el rango
  static getDateCondition(range: TimeRange): string {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    switch (range) {
      case "month":
        return `EXTRACT(MONTH FROM so.date_order) = ${currentMonth} 
                AND EXTRACT(YEAR FROM so.date_order) = ${currentYear}`

      case "quarter":
        const currentQuarter = Math.ceil(currentMonth / 3)
        const quarterStartMonth = (currentQuarter - 1) * 3 + 1
        const quarterEndMonth = currentQuarter * 3

        return `EXTRACT(MONTH FROM so.date_order) BETWEEN ${quarterStartMonth} AND ${quarterEndMonth}
                AND EXTRACT(YEAR FROM so.date_order) = ${currentYear}`

      case "year":
        return `EXTRACT(YEAR FROM so.date_order) = ${currentYear}`

      default:
        return `EXTRACT(MONTH FROM so.date_order) = ${currentMonth} 
                AND EXTRACT(YEAR FROM so.date_order) = ${currentYear}`
    }
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

  // Obtener órdenes de venta con filtros
  static async getSaleOrders(
    range: TimeRange,
    state: SaleOrderState | 'all' = 'all',
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: SaleOrder[], meta: any }> {
    const dateCondition = this.getDateCondition(range)
    const offset = (page - 1) * limit

    let stateCondition = ""
    if (state !== 'all') {
      stateCondition = `AND so.state = '${state}'`
    }

    // Solo incluir vendedores específicos
    const allowedUserIds = [11, 12, 13, 37]
    const userCondition = `AND so.user_id IN (${allowedUserIds.join(', ')})`

    const baseQuery = `
      SELECT 
        so.id,
        so.name,
        rp.name AS partner_name,
        so.date_order,
        so.amount_total_mn,
        so.state,
        COALESCE(rp_user.name, ru.login, 'Sin asignar') AS user_name,
        COALESCE(st.name, 'Sin equipo') AS team_name,
        so.validity_date,
        so.commitment_date
      FROM sale_order so
      JOIN res_partner rp ON so.partner_id = rp.id
      LEFT JOIN res_users ru ON so.user_id = ru.id
      LEFT JOIN res_partner rp_user ON ru.partner_id = rp_user.id
      LEFT JOIN crm_team st ON so.team_id = st.id
      WHERE ${dateCondition}
        ${stateCondition}
        ${userCondition}
      ORDER BY so.date_order DESC
    `

    // Obtener total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sale_order so
      WHERE ${dateCondition}
        ${stateCondition}
        ${userCondition}
    `

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery),
        db.query(`${baseQuery} OFFSET $1 LIMIT $2`, [offset, limit])
      ])

      const total = parseInt(countResult.rows[0].total, 10)
      const totalPages = Math.ceil(total / limit)

      // Procesar datos
      const processedData = dataResult.rows.map(row => ({
        id: parseInt(String(row.id), 10),
        name: String(row.name || ''),
        partner_name: String(row.partner_name || ''),
        date_order: String(row.date_order || ''),
        amount_total_mn: parseFloat(String(row.amount_total_mn) || '0'),
        state: row.state as SaleOrderState,
        user_name: row.user_name ? String(row.user_name) : undefined,
        team_name: row.team_name ? String(row.team_name) : undefined,
        validity_date: row.validity_date ? String(row.validity_date) : undefined,
        commitment_date: row.commitment_date ? String(row.commitment_date) : undefined
      }))

      return {
        data: processedData,
        meta: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit
        }
      }
    } catch (error) {
      console.error("Error in getSaleOrders:", error)

      // Fallback query más simple
      const simpleQuery = `
        SELECT 
          so.id,
          so.name,
          rp.name AS partner_name,
          so.date_order,
          so.amount_total_mn,
          so.state,
          ru.login AS user_name
        FROM sale_order so
        JOIN res_partner rp ON so.partner_id = rp.id
        LEFT JOIN res_users ru ON so.user_id = ru.id
        WHERE ${dateCondition}
          ${stateCondition}
          ${userCondition}
        ORDER BY so.date_order DESC
        OFFSET $1 LIMIT $2
      `

      const simpleCountQuery = `
        SELECT COUNT(*) as total
        FROM sale_order so
        WHERE ${dateCondition}
          ${stateCondition}
          ${userCondition}
      `

      const [countResult, dataResult] = await Promise.all([
        db.query(simpleCountQuery),
        db.query(simpleQuery, [offset, limit])
      ])

      const total = parseInt(countResult.rows[0].total, 10)
      const totalPages = Math.ceil(total / limit)

      const processedData = dataResult.rows.map(row => ({
        id: parseInt(String(row.id), 10),
        name: String(row.name || ''),
        partner_name: String(row.partner_name || ''),
        date_order: String(row.date_order || ''),
        amount_total_mn: parseFloat(String(row.amount_total_mn) || '0'),
        state: row.state as SaleOrderState,
        user_name: row.user_name ? String(row.user_name) : undefined,
        team_name: undefined,
        validity_date: undefined,
        commitment_date: undefined
      }))

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

  // Obtener estadísticas de ventas
  static async getSalesStats(range: TimeRange): Promise<SalesStats> {
    const dateCondition = this.getDateCondition(range)

    // Solo incluir vendedores específicos
    const allowedUserIds = [11, 12, 13, 37]
    const userCondition = `AND so.user_id IN (${allowedUserIds.join(', ')})`

    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE state IN ('draft', 'sent')) AS total_quotations,
        COUNT(*) FILTER (WHERE state IN ('sale', 'done')) AS confirmed_sales,
        SUM(amount_total_mn) FILTER (WHERE state IN ('draft', 'sent')) AS quotation_amount,
        SUM(amount_total_mn) FILTER (WHERE state IN ('sale', 'done')) AS sales_amount,
        AVG(amount_total_mn) FILTER (WHERE state IN ('draft', 'sent')) AS avg_quotation,
        AVG(amount_total_mn) FILTER (WHERE state IN ('sale', 'done')) AS avg_sale
      FROM sale_order so
      WHERE ${dateCondition}
        ${userCondition}
    `

    const result = await db.query(query)
    const row = result.rows[0]

    const totalQuotations = parseInt(String(row.total_quotations) || '0', 10)
    const confirmedSales = parseInt(String(row.confirmed_sales) || '0', 10)
    const conversionRate = totalQuotations > 0 ? (confirmedSales / totalQuotations) * 100 : 0

    return {
      totalQuotations,
      confirmedSales,
      conversionRate,
      totalQuotationAmount: parseFloat(String(row.quotation_amount) || '0'),
      totalSalesAmount: parseFloat(String(row.sales_amount) || '0'),
      avgQuotationAmount: parseFloat(String(row.avg_quotation) || '0'),
      avgSaleAmount: parseFloat(String(row.avg_sale) || '0'),
      period: this.getPeriodDescription(range)
    }
  }

  // Obtener resumen de ventas
  static async getSalesSummary(range: TimeRange): Promise<SalesSummary> {
    const dateCondition = this.getDateCondition(range)

    // Solo incluir vendedores específicos
    const allowedUserIds = [11, 12, 13, 37]
    const userCondition = `AND so.user_id IN (${allowedUserIds.join(', ')})`

    const query = `
      SELECT 
        state,
        COUNT(*) as count,
        SUM(amount_total_mn) as amount
      FROM sale_order so
      WHERE ${dateCondition}
        ${userCondition}
      GROUP BY state
    `

    const result = await db.query(query)

    // Inicializar estructura
    const summary: SalesSummary = {
      quotations: {
        count: 0,
        amount: 0,
        states: { draft: 0, sent: 0 }
      },
      sales: {
        count: 0,
        amount: 0,
        states: { sale: 0, done: 0 }
      },
      conversion: {
        rate: 0,
        lost: 0
      }
    }

    // Procesar resultados
    result.rows.forEach(row => {
      const state = row.state as SaleOrderState
      const count = parseInt(String(row.count), 10)
      const amount = parseFloat(String(row.amount) || '0')

      switch (state) {
        case 'draft':
          summary.quotations.count += count
          summary.quotations.amount += amount
          summary.quotations.states.draft = count
          break
        case 'sent':
          summary.quotations.count += count
          summary.quotations.amount += amount
          summary.quotations.states.sent = count
          break
        case 'sale':
          summary.sales.count += count
          summary.sales.amount += amount
          summary.sales.states.sale = count
          break
        case 'done':
          summary.sales.count += count
          summary.sales.amount += amount
          summary.sales.states.done = count
          break
        case 'cancel':
          summary.conversion.lost += count
          break
      }
    })

    // Calcular tasa de conversión
    const totalOpportunities = summary.quotations.count + summary.sales.count
    summary.conversion.rate = totalOpportunities > 0
      ? (summary.sales.count / totalOpportunities) * 100
      : 0

    return summary
  }

  // Obtener cotizaciones (estados draft y sent)
  static async getQuotations(range: TimeRange, limit: number = 10, page: number = 1) {
    const dateCondition = this.getDateCondition(range)
    const offset = (page - 1) * 10 // 10 por página fijo para cotizaciones

    // Solo incluir vendedores específicos
    const allowedUserIds = [11, 12, 13, 37]
    const userCondition = `AND so.user_id IN (${allowedUserIds.join(', ')})`

    const baseQuery = `
      SELECT 
        so.id,
        so.name,
        rp.name AS partner_name,
        so.date_order,
        so.amount_total_mn,
        so.state,
        COALESCE(rp_user.name, ru.login, 'Sin asignar') AS user_name,
        so.validity_date
      FROM sale_order so
      JOIN res_partner rp ON so.partner_id = rp.id
      LEFT JOIN res_users ru ON so.user_id = ru.id
      LEFT JOIN res_partner rp_user ON ru.partner_id = rp_user.id
      WHERE ${dateCondition}
        AND so.state IN ('draft', 'sent')
        ${userCondition}
      ORDER BY so.date_order DESC
    `

    // Obtener total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sale_order so
      WHERE ${dateCondition}
        AND so.state IN ('draft', 'sent')
        ${userCondition}
    `

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery),
        db.query(`${baseQuery} OFFSET $1 LIMIT $2`, [offset, limit])
      ])

      const total = parseInt(countResult.rows[0].total, 10)
      const totalPages = Math.ceil(total / 10)

      // Procesar datos
      const processedData = dataResult.rows.map(row => ({
        id: parseInt(String(row.id), 10),
        name: String(row.name || ''),
        partner_name: String(row.partner_name || ''),
        date_order: String(row.date_order || ''),
        amount_total_mn: parseFloat(String(row.amount_total_mn) || '0'),
        state: row.state as SaleOrderState,
        user_name: row.user_name ? String(row.user_name) : undefined,
        validity_date: row.validity_date ? String(row.validity_date) : undefined
      }))

      return {
        data: processedData,
        meta: {
          total,
          totalPages,
          currentPage: page,
          perPage: 10
        }
      }
    } catch (error) {
      console.error("Error in getQuotations:", error)

      // Fallback query más simple
      const simpleQuery = `
        SELECT 
          so.id,
          so.name,
          rp.name AS partner_name,
          so.date_order,
          so.amount_total_mn,
          so.state,
          ru.login AS user_name,
          so.validity_date
        FROM sale_order so
        JOIN res_partner rp ON so.partner_id = rp.id
        LEFT JOIN res_users ru ON so.user_id = ru.id
        WHERE ${dateCondition}
          AND so.state IN ('draft', 'sent')
          ${userCondition}
        ORDER BY so.date_order DESC
        OFFSET $1 LIMIT $2
      `

      const simpleCountQuery = `
        SELECT COUNT(*) as total
        FROM sale_order so
        WHERE ${dateCondition}
          AND so.state IN ('draft', 'sent')
          ${userCondition}
      `

      const [countResult, dataResult] = await Promise.all([
        db.query(simpleCountQuery),
        db.query(simpleQuery, [offset, limit])
      ])

      const total = parseInt(countResult.rows[0].total, 10)
      const totalPages = Math.ceil(total / 10)

      const processedData = dataResult.rows.map(row => ({
        id: parseInt(String(row.id), 10),
        name: String(row.name || ''),
        partner_name: String(row.partner_name || ''),
        date_order: String(row.date_order || ''),
        amount_total_mn: parseFloat(String(row.amount_total_mn) || '0'),
        state: row.state as SaleOrderState,
        user_name: row.user_name ? String(row.user_name) : undefined,
        validity_date: row.validity_date ? String(row.validity_date) : undefined
      }))

      return {
        data: processedData,
        meta: {
          total,
          totalPages,
          currentPage: page,
          perPage: 10
        }
      }
    }
  }
  static async getTopSalespeople(range: TimeRange, limit: number = 5) {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        ru.name AS salesperson_name,
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE so.state IN ('sale', 'done')) as confirmed_orders,
        SUM(so.amount_total_mn) as total_amount,
        SUM(so.amount_total_mn) FILTER (WHERE so.state IN ('sale', 'done')) as confirmed_amount
      FROM sale_order so
      JOIN res_users ru ON so.user_id = ru.id
      WHERE ${dateCondition}
      GROUP BY ru.id, ru.name
      ORDER BY confirmed_amount DESC NULLS LAST
      LIMIT $1
    `

    const result = await db.query(query, [limit])

    return result.rows.map(row => ({
      salesperson_name: String(row.salesperson_name || ''),
      total_orders: parseInt(String(row.total_orders), 10),
      confirmed_orders: parseInt(String(row.confirmed_orders), 10),
      total_amount: parseFloat(String(row.total_amount) || '0'),
      confirmed_amount: parseFloat(String(row.confirmed_amount) || '0'),
      conversion_rate: row.total_orders > 0
        ? (parseInt(String(row.confirmed_orders)) / parseInt(String(row.total_orders))) * 100
        : 0
    }))
  }

  static async getSalesEvolution(range: TimeRange): Promise<{ data: any[] }> {
    const dateCondition = this.getDateCondition(range)

    // Solo incluir vendedores específicos
    const allowedUserIds = [11, 12, 13, 37]
    const userCondition = `AND so.user_id IN (${allowedUserIds.join(', ')})`

    let groupBy = ""
    let selectField = ""
    let orderField = ""

    switch (range) {
      case "month":
        selectField = "EXTRACT(DAY FROM so.date_order) as period"
        groupBy = "EXTRACT(DAY FROM so.date_order)"
        orderField = "period"
        break
      case "quarter":
        selectField = "EXTRACT(WEEK FROM so.date_order) as period"
        groupBy = "EXTRACT(WEEK FROM so.date_order)"
        orderField = "period"
        break
      case "year":
        selectField = "EXTRACT(MONTH FROM so.date_order) as period"
        groupBy = "EXTRACT(MONTH FROM so.date_order)"
        orderField = "period"
        break
    }

    const query = `
    SELECT 
      ${selectField},
      COUNT(*) as total_orders,
      SUM(amount_total_mn) as total_amount,
      AVG(amount_total_mn) as avg_ticket
    FROM sale_order so
    WHERE ${dateCondition}
      AND so.state IN ('sale', 'done')
      ${userCondition}
    GROUP BY ${groupBy}
    ORDER BY ${orderField}
  `

    const result = await db.query(query)

    // Procesar los resultados para asegurar tipos correctos
    const processedData = result.rows.map(row => ({
      period: parseInt(String(row.period), 10),
      total_orders: parseInt(String(row.total_orders), 10),
      total_amount: parseFloat(String(row.total_amount) || '0'),
      avg_ticket: parseFloat(String(row.avg_ticket) || '0')
    }))

    return { data: processedData }
  }

  static async getTicketEvolution(range: TimeRange): Promise<{ data: any[] }> {
    const dateCondition = this.getDateCondition(range)

    // Solo incluir vendedores específicos
    const allowedUserIds = [11, 12, 13, 37]
    const userCondition = `AND so.user_id IN (${allowedUserIds.join(', ')})`

    let groupBy = ""
    let selectField = ""
    let orderField = ""

    switch (range) {
      case "month":
        selectField = "EXTRACT(DAY FROM so.date_order) as period"
        groupBy = "EXTRACT(DAY FROM so.date_order)"
        orderField = "period"
        break
      case "quarter":
        selectField = "EXTRACT(WEEK FROM so.date_order) as period"
        groupBy = "EXTRACT(WEEK FROM so.date_order)"
        orderField = "period"
        break
      case "year":
        selectField = "EXTRACT(MONTH FROM so.date_order) as period"
        groupBy = "EXTRACT(MONTH FROM so.date_order)"
        orderField = "period"
        break
    }

    const query = `
    SELECT 
      ${selectField},
      AVG(amount_total_mn) as avg_ticket,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_total_mn) as median_ticket,
      MIN(amount_total_mn) as min_ticket,
      MAX(amount_total_mn) as max_ticket
    FROM sale_order so
    WHERE ${dateCondition}
      AND so.state IN ('sale', 'done')
      ${userCondition}
    GROUP BY ${groupBy}
    ORDER BY ${orderField}
  `

    const result = await db.query(query)

    // Procesar los resultados para asegurar tipos correctos
    const processedData = result.rows.map(row => ({
      period: parseInt(String(row.period), 10),
      avg_ticket: parseFloat(String(row.avg_ticket) || '0'),
      median_ticket: parseFloat(String(row.median_ticket) || '0'),
      min_ticket: parseFloat(String(row.min_ticket) || '0'),
      max_ticket: parseFloat(String(row.max_ticket) || '0')
    }))

    return { data: processedData }
  }
}