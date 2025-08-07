// src/services/posService.ts
import db from "@/lib/db"
import type { QueryResult } from "pg"

// Tipos para POS
export interface POSOrder {
  id: number
  name: string
  partner_name: string | null
  date_order: string
  amount_total: number
  state: POSOrderState
  salesperson: string | null // custom_selection field
  payment_method?: string
  session_name?: string
  lines_count: number
}

export interface POSStats {
  totalSales: number
  totalAmount: number
  totalCustomers: number
  avgTicket: number
  totalTransactions: number
  period: string
}

export interface POSSalesPerson {
  salesperson: string
  total_sales: number
  total_amount: number
  avg_ticket: number
  percentage: number
}

export interface POSHourlySales {
  hour: number
  sales_count: number
  total_amount: number
}

export interface POSProductRanking {
  product_name: string
  quantity_sold: number
  total_amount: number
  avg_price: number
}

export type POSOrderState = 'draft' | 'paid' | 'done' | 'invoiced' | 'cancel'
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year'

export class POSService {
  // Obtener condición de fecha según el rango
  static getDateCondition(range: TimeRange): string {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (range) {
      case "today":
        const endOfDay = new Date(today)
        endOfDay.setHours(23, 59, 59, 999)
        return `po.date_order >= '${today.toISOString()}' AND po.date_order <= '${endOfDay.toISOString()}'`

      case "week":
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return `po.date_order >= '${startOfWeek.toISOString()}'`

      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return `po.date_order >= '${startOfMonth.toISOString()}'`

      case "quarter":
        const currentQuarter = Math.floor(today.getMonth() / 3)
        const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1)
        return `po.date_order >= '${startOfQuarter.toISOString()}'`

      case "year":
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        return `po.date_order >= '${startOfYear.toISOString()}'`

      default:
        const defaultEndOfDay = new Date(today)
        defaultEndOfDay.setHours(23, 59, 59, 999)
        return `po.date_order >= '${today.toISOString()}' AND po.date_order <= '${defaultEndOfDay.toISOString()}'`
    }
  }

  // Obtener descripción del período
  static getPeriodDescription(range: TimeRange): string {
    const now = new Date()
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    switch (range) {
      case "today":
        return `Hoy ${now.getDate()} de ${monthNames[now.getMonth()]}`
      case "week":
        return "Esta semana"
      case "month":
        return `${monthNames[now.getMonth()]} ${now.getFullYear()}`
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3) + 1
        return `Q${quarter} ${now.getFullYear()}`
      case "year":
        return `${now.getFullYear()}`
      default:
        return `Hoy ${now.getDate()} de ${monthNames[now.getMonth()]}`
    }
  }

  // Obtener estadísticas generales de POS
  static async getPOSStats(range: TimeRange): Promise<POSStats> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(po.amount_total) as total_amount,
        COUNT(DISTINCT po.partner_id) FILTER (WHERE po.partner_id IS NOT NULL) as total_customers,
        AVG(po.amount_total) as avg_ticket,
        COUNT(*) FILTER (WHERE po.state IN ('paid', 'done', 'invoiced')) as total_transactions
      FROM pos_order po
      WHERE ${dateCondition}
        AND po.state IN ('paid', 'done', 'invoiced')
    `

    const result = await db.query(query)
    const row = result.rows[0]

    return {
      totalSales: parseInt(String(row.total_sales) || '0', 10),
      totalAmount: parseFloat(String(row.total_amount) || '0'),
      totalCustomers: parseInt(String(row.total_customers) || '0', 10),
      avgTicket: parseFloat(String(row.avg_ticket) || '0'),
      totalTransactions: parseInt(String(row.total_transactions) || '0', 10),
      period: this.getPeriodDescription(range)
    }
  }

  // Obtener órdenes de POS con paginación
  static async getPOSOrders(
    range: TimeRange,
    page: number = 1,
    limit: number = 10,
    salesperson?: string
  ): Promise<{ data: POSOrder[], meta: any }> {
    const dateCondition = this.getDateCondition(range)
    const offset = (page - 1) * limit

    let salespersonCondition = ""
    if (salesperson && salesperson !== 'all') {
      salespersonCondition = `AND po.custom_selection = '${salesperson}'`
    }

    const baseQuery = `
      SELECT 
        po.id,
        po.name,
        COALESCE(rp.name, 'Cliente General') AS partner_name,
        po.date_order,
        po.amount_total,
        po.state,
        po.custom_selection AS salesperson,
        ps.name AS session_name,
        (SELECT COUNT(*) FROM pos_order_line pol WHERE pol.order_id = po.id) AS lines_count
      FROM pos_order po
      LEFT JOIN res_partner rp ON po.partner_id = rp.id
      LEFT JOIN pos_session ps ON po.session_id = ps.id
      WHERE ${dateCondition}
        AND po.state IN ('paid', 'done', 'invoiced')
        ${salespersonCondition}
      ORDER BY po.date_order DESC
    `

    const countQuery = `
      SELECT COUNT(*) as total
      FROM pos_order po
      WHERE ${dateCondition}
        AND po.state IN ('paid', 'done', 'invoiced')
        ${salespersonCondition}
    `

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery),
        db.query(`${baseQuery} OFFSET $1 LIMIT $2`, [offset, limit])
      ])

      const total = parseInt(countResult.rows[0].total, 10)
      const totalPages = Math.ceil(total / limit)

      const processedData = dataResult.rows.map(row => ({
        id: parseInt(String(row.id), 10),
        name: String(row.name || ''),
        partner_name: String(row.partner_name || 'Cliente General'),
        date_order: String(row.date_order || ''),
        amount_total: parseFloat(String(row.amount_total) || '0'),
        state: row.state as POSOrderState,
        salesperson: row.salesperson ? String(row.salesperson) : null,
        session_name: row.session_name ? String(row.session_name) : undefined,
        lines_count: parseInt(String(row.lines_count) || '0', 10)
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
      console.error("Error in getPOSOrders:", error)
      throw error
    }
  }

  // Obtener ventas por vendedor
  static async getSalesByPerson(range: TimeRange): Promise<POSSalesPerson[]> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        COALESCE(po.custom_selection, 'Sin asignar') AS salesperson,
        COUNT(*) as total_sales,
        SUM(po.amount_total) as total_amount,
        AVG(po.amount_total) as avg_ticket
      FROM pos_order po
      WHERE ${dateCondition}
        AND po.state IN ('paid', 'done', 'invoiced')
      GROUP BY po.custom_selection
      ORDER BY total_amount DESC
    `

    const result = await db.query(query)
    const totalAmount = result.rows.reduce((sum, row) => sum + parseFloat(String(row.total_amount) || '0'), 0)

    return result.rows.map(row => ({
      salesperson: String(row.salesperson || 'Sin asignar'),
      total_sales: parseInt(String(row.total_sales), 10),
      total_amount: parseFloat(String(row.total_amount) || '0'),
      avg_ticket: parseFloat(String(row.avg_ticket) || '0'),
      percentage: totalAmount > 0 ? (parseFloat(String(row.total_amount) || '0') / totalAmount) * 100 : 0
    }))
  }

  // Obtener ventas por hora del día (solo para rango "today")
  static async getHourlySales(date?: string): Promise<POSHourlySales[]> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const query = `
      SELECT 
        EXTRACT(HOUR FROM po.date_order) as hour,
        COUNT(*) as sales_count,
        SUM(po.amount_total) as total_amount
      FROM pos_order po
      WHERE DATE(po.date_order) = $1
        AND po.state IN ('paid', 'done', 'invoiced')
      GROUP BY EXTRACT(HOUR FROM po.date_order)
      ORDER BY hour
    `

    const result = await db.query(query, [targetDate])

    // Crear array con todas las horas (0-23) inicializadas en 0
    const hoursData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sales_count: 0,
      total_amount: 0
    }))

    // Llenar con datos reales y ajustar por UTC-5 (Lima)
    result.rows.forEach(row => {
      const originalHour = parseInt(String(row.hour), 10)
      // Ajustar UTC a UTC-5 (restar 5 horas)
      const adjustedHour = (originalHour - 5 + 24) % 24
      
      hoursData[adjustedHour] = {
        hour: adjustedHour,
        sales_count: parseInt(String(row.sales_count), 10),
        total_amount: parseFloat(String(row.total_amount) || '0')
      }
    })

    return hoursData
  }

  // Obtener productos más vendidos
  static async getTopProducts(range: TimeRange, limit: number = 10): Promise<POSProductRanking[]> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        pt.name AS product_name,
        SUM(pol.qty) as quantity_sold,
        SUM(pol.price_subtotal_incl) as total_amount,
        AVG(pol.price_unit) as avg_price
      FROM pos_order_line pol
      JOIN pos_order po ON pol.order_id = po.id
      JOIN product_product pp ON pol.product_id = pp.id
      JOIN product_template pt ON pp.product_tmpl_id = pt.id
      WHERE ${dateCondition}
        AND po.state IN ('paid', 'done', 'invoiced')
      GROUP BY pt.id, pt.name
      ORDER BY quantity_sold DESC
      LIMIT $1
    `

    const result = await db.query(query, [limit])

    return result.rows.map(row => ({
      product_name: String(row.product_name || ''),
      quantity_sold: parseFloat(String(row.quantity_sold) || '0'),
      total_amount: parseFloat(String(row.total_amount) || '0'),
      avg_price: parseFloat(String(row.avg_price) || '0')
    }))
  }

  // Obtener lista de vendedores disponibles
  static async getSalespersonList(): Promise<string[]> {
    const query = `
      SELECT DISTINCT custom_selection
      FROM pos_order
      WHERE custom_selection IS NOT NULL
        AND custom_selection != ''
      ORDER BY custom_selection
    `

    const result = await db.query(query)
    return result.rows.map(row => String(row.custom_selection))
  }
}