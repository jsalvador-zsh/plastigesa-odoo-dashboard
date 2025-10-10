// src/services/invoiceService.ts
import db from "@/lib/db"
import type {
  Invoice,
  InvoiceStats,
  InvoicesByType,
  InvoicesByJournal,
  InvoicesByState,
  Journal,
  InvoiceType,
  InvoiceState,
  TimeRange,
  InvoiceTrend,
  PaymentAnalysis
} from "@/types/invoice"

export class InvoiceService {
  // Obtener condición de fecha según el rango
  static getDateCondition(range: TimeRange, dateField: string = 'am.invoice_date'): string {
    const today = new Date()

    switch (range) {
      case "week":
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - 7)
        return `${dateField} >= '${startOfWeek.toISOString().split('T')[0]}'`

      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return `${dateField} >= '${startOfMonth.toISOString().split('T')[0]}'`

      case "quarter":
        const currentQuarter = Math.floor(today.getMonth() / 3)
        const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1)
        return `${dateField} >= '${startOfQuarter.toISOString().split('T')[0]}'`

      case "year":
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        return `${dateField} >= '${startOfYear.toISOString().split('T')[0]}'`

      case "all":
        return "1=1" // Sin filtro de fecha

      default:
        const startOfDefaultMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return `${dateField} >= '${startOfDefaultMonth.toISOString().split('T')[0]}'`
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
      case "week":
        return "Últimos 7 días"
      case "month":
        return `${monthNames[now.getMonth()]} ${now.getFullYear()}`
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3) + 1
        return `Q${quarter} ${now.getFullYear()}`
      case "year":
        return `${now.getFullYear()}`
      case "all":
        return "Todos los períodos"
      default:
        return `${monthNames[now.getMonth()]} ${now.getFullYear()}`
    }
  }

  // Obtener estadísticas generales de facturación
  static async getInvoiceStats(range: TimeRange, type?: InvoiceType): Promise<InvoiceStats> {
    const dateCondition = this.getDateCondition(range)
    
    let typeCondition = ""
    if (type && type !== 'entry') {
      typeCondition = `AND am.type = '${type}'`
    } else if (!type) {
      typeCondition = `AND am.type IN ('out_invoice', 'out_refund')`
    }

    const query = `
      SELECT 
        COUNT(*) as total_invoices,
        SUM(CASE 
          WHEN am.type = 'out_invoice' AND am.estado_comprobante_electronico != '2_ANULADO' THEN am.amount_total
          WHEN am.type = 'out_refund' AND am.estado_comprobante_electronico != '2_ANULADO' THEN -ABS(am.amount_total)
          ELSE 0
        END) as total_amount,
        SUM(CASE WHEN am.invoice_payment_state = 'paid' AND am.estado_comprobante_electronico != '2_ANULADO' THEN am.amount_total ELSE 0 END) as total_paid,
        SUM(CASE WHEN am.invoice_payment_state IN ('not_paid', 'partial') AND am.estado_comprobante_electronico != '2_ANULADO' THEN am.amount_residual ELSE 0 END) as total_pending,
        SUM(CASE WHEN am.estado_comprobante_electronico = '2_ANULADO' OR am.state = 'cancel' THEN 1 ELSE 0 END) as total_canceled,
        AVG(CASE WHEN am.estado_comprobante_electronico != '2_ANULADO' THEN am.amount_total ELSE NULL END) as avg_invoice_amount
      FROM account_move am
      WHERE ${dateCondition}
        AND am.state != 'draft'
        ${typeCondition}
    `

    const result = await db.query(query)
    const row = result.rows[0]

    return {
      totalInvoices: parseInt(String(row.total_invoices) || '0', 10),
      totalAmount: parseFloat(String(row.total_amount) || '0'),
      totalPaid: parseFloat(String(row.total_paid) || '0'),
      totalPending: parseFloat(String(row.total_pending) || '0'),
      totalCanceled: parseInt(String(row.total_canceled) || '0', 10),
      avgInvoiceAmount: parseFloat(String(row.avg_invoice_amount) || '0'),
      period: this.getPeriodDescription(range)
    }
  }

  // Obtener facturas con paginación
  static async getInvoices(
    range: TimeRange,
    page: number = 1,
    limit: number = 20,
    type?: InvoiceType,
    state?: InvoiceState,
    journalId?: number
  ): Promise<{ data: Invoice[], meta: any }> {
    const dateCondition = this.getDateCondition(range)
    const offset = (page - 1) * limit

    let typeCondition = ""
    if (type && type !== 'entry') {
      typeCondition = `AND am.type = '${type}'`
    }

    let stateCondition = ""
    if (state) {
      stateCondition = `AND am.state = '${state}'`
    }

    let journalCondition = ""
    if (journalId) {
      journalCondition = `AND am.journal_id = ${journalId}`
    }

    const baseQuery = `
      SELECT 
        am.id,
        am.name,
        am.type as move_type,
        COALESCE(rp.name, 'Sin cliente') as partner_name,
        am.invoice_date,
        am.invoice_date_due,
        am.amount_untaxed,
        am.amount_tax,
        am.amount_total,
        am.amount_residual,
        am.state,
        am.invoice_payment_state as payment_state,
        aj.name as journal_name,
        rc.name as currency_name,
        COALESCE(ru.login, 'Sin asignar') as invoice_user_name,
        am.invoice_type_code,
        am.tipo_pago,
        am.tipo_nota_credito,
        am.sustento_nota,
        am.estado_comprobante_electronico,
        am.documento_baja_id
      FROM account_move am
      LEFT JOIN res_partner rp ON am.partner_id = rp.id
      LEFT JOIN account_journal aj ON am.journal_id = aj.id
      LEFT JOIN res_currency rc ON am.currency_id = rc.id
      LEFT JOIN res_users ru ON am.invoice_user_id = ru.id
      WHERE ${dateCondition}
        ${typeCondition}
        ${stateCondition}
        ${journalCondition}
      ORDER BY am.invoice_date DESC, am.id DESC
    `

    const countQuery = `
      SELECT COUNT(*) as total
      FROM account_move am
      WHERE ${dateCondition}
        ${typeCondition}
        ${stateCondition}
        ${journalCondition}
    `

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery),
        db.query(`${baseQuery} OFFSET $1 LIMIT $2`, [offset, limit])
      ])

      const total = parseInt(countResult.rows[0].total, 10)
      const totalPages = Math.ceil(total / limit)

      const processedData: Invoice[] = dataResult.rows.map(row => ({
        id: parseInt(String(row.id), 10),
        name: String(row.name || ''),
        move_type: row.move_type as InvoiceType,
        partner_name: String(row.partner_name || 'Sin cliente'),
        invoice_date: row.invoice_date ? String(row.invoice_date) : null,
        invoice_date_due: row.invoice_date_due ? String(row.invoice_date_due) : null,
        amount_untaxed: parseFloat(String(row.amount_untaxed) || '0'),
        amount_tax: parseFloat(String(row.amount_tax) || '0'),
        amount_total: parseFloat(String(row.amount_total) || '0'),
        amount_residual: parseFloat(String(row.amount_residual) || '0'),
        state: row.state as InvoiceState,
        payment_state: row.payment_state,
        journal_name: String(row.journal_name || ''),
        currency_name: row.currency_name ? String(row.currency_name) : undefined,
        invoice_user_name: row.invoice_user_name ? String(row.invoice_user_name) : undefined
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
      console.error("Error in getInvoices:", error)
      throw error
    }
  }

  // Obtener facturación por tipo
  static async getInvoicesByType(range: TimeRange): Promise<InvoicesByType[]> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        am.type,
        COUNT(*) as count,
        SUM(ABS(am.amount_total)) as total_amount
      FROM account_move am
      WHERE ${dateCondition}
        AND am.state = 'posted'
        AND am.type IN ('out_invoice', 'out_refund')
        AND (am.estado_comprobante_electronico IS NULL OR am.estado_comprobante_electronico != '2_ANULADO')
      GROUP BY am.type
      ORDER BY total_amount DESC
    `

    const result = await db.query(query)
    const totalAmount = result.rows.reduce((sum, row) => sum + parseFloat(String(row.total_amount) || '0'), 0)

    const typeLabels: Record<string, string> = {
      out_invoice: 'Facturas',
      out_refund: 'Notas de Crédito',
      in_invoice: 'Facturas de Proveedor',
      in_refund: 'NC de Proveedor'
    }

    return result.rows.map(row => ({
      type: row.type as InvoiceType,
      type_label: typeLabels[row.type] || row.type,
      count: parseInt(String(row.count), 10),
      total_amount: parseFloat(String(row.total_amount) || '0'),
      percentage: totalAmount > 0 ? (parseFloat(String(row.total_amount) || '0') / totalAmount) * 100 : 0
    }))
  }

  // Obtener facturación por diario
  static async getInvoicesByJournal(range: TimeRange): Promise<InvoicesByJournal[]> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        aj.id as journal_id,
        aj.name as journal_name,
        aj.code as journal_code,
        COUNT(*) as count,
        SUM(ABS(am.amount_total)) as total_amount
      FROM account_move am
      JOIN account_journal aj ON am.journal_id = aj.id
      WHERE ${dateCondition}
        AND am.state = 'posted'
        AND am.type IN ('out_invoice', 'out_refund')
        AND (am.estado_comprobante_electronico IS NULL OR am.estado_comprobante_electronico != '2_ANULADO')
      GROUP BY aj.id, aj.name, aj.code
      ORDER BY total_amount DESC
    `

    const result = await db.query(query)
    const totalAmount = result.rows.reduce((sum, row) => sum + parseFloat(String(row.total_amount) || '0'), 0)

    return result.rows.map(row => ({
      journal_id: parseInt(String(row.journal_id), 10),
      journal_name: String(row.journal_name || ''),
      journal_code: String(row.journal_code || ''),
      count: parseInt(String(row.count), 10),
      total_amount: parseFloat(String(row.total_amount) || '0'),
      percentage: totalAmount > 0 ? (parseFloat(String(row.total_amount) || '0') / totalAmount) * 100 : 0
    }))
  }

  // Obtener facturación por estado
  static async getInvoicesByState(range: TimeRange): Promise<InvoicesByState[]> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        am.state,
        COUNT(*) as count,
        SUM(ABS(am.amount_total)) as total_amount
      FROM account_move am
      WHERE ${dateCondition}
        AND am.type IN ('out_invoice', 'out_refund')
      GROUP BY am.state
      ORDER BY count DESC
    `

    const result = await db.query(query)

    const stateLabels: Record<string, string> = {
      draft: 'Borrador',
      posted: 'Publicado',
      cancel: 'Cancelado'
    }

    return result.rows.map(row => ({
      state: row.state as InvoiceState,
      state_label: stateLabels[row.state] || row.state,
      count: parseInt(String(row.count), 10),
      total_amount: parseFloat(String(row.total_amount) || '0')
    }))
  }

  // Obtener lista de diarios
  static async getJournals(): Promise<Journal[]> {
    const query = `
      SELECT 
        id,
        name,
        code,
        type,
        active
      FROM account_journal
      WHERE type IN ('sale', 'purchase')
        AND active = true
      ORDER BY name
    `

    const result = await db.query(query)

    return result.rows.map(row => ({
      id: parseInt(String(row.id), 10),
      name: String(row.name || ''),
      code: String(row.code || ''),
      type: row.type,
      active: Boolean(row.active)
    }))
  }

  // Obtener tendencias de facturación
  static async getInvoiceTrends(range: TimeRange): Promise<InvoiceTrend[]> {
    const groupBy = range === 'year' ? 'YYYY-MM' : range === 'quarter' ? 'YYYY-MM' : 'YYYY-MM-DD'
    
    const query = `
      SELECT 
        to_char(am.invoice_date, '${groupBy}') as period,
        COUNT(*) FILTER (WHERE am.type = 'out_invoice') as invoices,
        COUNT(*) FILTER (WHERE am.type = 'out_refund') as refunds,
        SUM(CASE 
          WHEN am.type = 'out_invoice' THEN am.amount_total
          WHEN am.type = 'out_refund' THEN -ABS(am.amount_total)
          ELSE 0
        END) as net_amount,
        SUM(CASE WHEN am.type = 'out_invoice' THEN am.amount_total ELSE 0 END) as total_invoices_amount,
        SUM(CASE WHEN am.type = 'out_refund' THEN ABS(am.amount_total) ELSE 0 END) as total_refunds_amount
      FROM account_move am
      WHERE ${this.getDateCondition(range)}
        AND am.state = 'posted'
        AND am.type IN ('out_invoice', 'out_refund')
      GROUP BY period
      ORDER BY period ASC
    `

    const result = await db.query(query)

    return result.rows.map(row => ({
      period: String(row.period || ''),
      invoices: parseInt(String(row.invoices) || '0', 10),
      refunds: parseInt(String(row.refunds) || '0', 10),
      net_amount: parseFloat(String(row.net_amount) || '0'),
      total_invoices_amount: parseFloat(String(row.total_invoices_amount) || '0'),
      total_refunds_amount: parseFloat(String(row.total_refunds_amount) || '0')
    }))
  }

  // Obtener análisis de pagos
  static async getPaymentAnalysis(range: TimeRange): Promise<PaymentAnalysis> {
    const dateCondition = this.getDateCondition(range)

    const query = `
      SELECT 
        SUM(CASE WHEN am.type = 'out_invoice' THEN am.amount_total ELSE 0 END) as total_invoiced,
        SUM(CASE WHEN am.invoice_payment_state = 'paid' AND am.type = 'out_invoice' THEN am.amount_total ELSE 0 END) as total_paid,
        SUM(CASE WHEN am.invoice_payment_state IN ('not_paid', 'partial') AND am.type = 'out_invoice' THEN am.amount_residual ELSE 0 END) as total_pending
      FROM account_move am
      WHERE ${dateCondition}
        AND am.state = 'posted'
        AND am.type = 'out_invoice'
    `

    const result = await db.query(query)
    const row = result.rows[0]

    const totalInvoiced = parseFloat(String(row.total_invoiced) || '0')
    const totalPaid = parseFloat(String(row.total_paid) || '0')
    const totalPending = parseFloat(String(row.total_pending) || '0')

    return {
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      total_pending: totalPending,
      payment_rate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0
    }
  }
}

