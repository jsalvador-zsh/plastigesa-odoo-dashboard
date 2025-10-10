// src/types/invoice.ts

export interface Invoice {
  id: number
  name: string // Número de factura
  move_type: InvoiceType
  partner_name: string
  invoice_date: string | null
  invoice_date_due: string | null
  amount_untaxed: number
  amount_tax: number
  amount_total: number
  amount_residual: number // Saldo pendiente
  state: InvoiceState
  journal_name: string
  currency_name?: string
  invoice_user_name?: string // Vendedor/responsable
  payment_state?: PaymentState
  invoice_type_code?: string // Código tipo doc: 01=Factura, 03=Boleta, 07=NC, 08=ND
  tipo_pago?: string // efectivo, credito, transferencia
  tipo_nota_credito?: string // Motivo de NC
  sustento_nota?: string // Sustento de la nota
  estado_comprobante_electronico?: string // Estado: 1_ACEPTADO, 2_ANULADO, 3_OBSERVADO
  documento_baja_id?: number | null // ID del documento de baja (si fue anulado)
}

export type InvoiceType = 
  | 'out_invoice'    // Factura de cliente
  | 'out_refund'     // Nota de crédito de cliente
  | 'in_invoice'     // Factura de proveedor
  | 'in_refund'      // Nota de crédito de proveedor
  | 'entry'          // Asiento contable

export type InvoiceState = 
  | 'draft'    // Borrador
  | 'posted'   // Publicado/Contabilizado
  | 'cancel'   // Cancelado

export type PaymentState =
  | 'not_paid'      // No pagado
  | 'in_payment'    // En proceso de pago
  | 'paid'          // Pagado
  | 'partial'       // Pago parcial
  | 'reversed'      // Revertido
  | 'invoicing_legacy' // Legado

export interface InvoiceStats {
  totalInvoices: number
  totalAmount: number
  totalPaid: number
  totalPending: number
  totalCanceled: number
  avgInvoiceAmount: number
  period: string
}

export interface InvoicesByType {
  type: InvoiceType
  type_label: string
  count: number
  total_amount: number
  percentage: number
}

export interface InvoicesByJournal {
  journal_id: number
  journal_name: string
  journal_code: string
  count: number
  total_amount: number
  percentage: number
}

export interface InvoicesByState {
  state: InvoiceState
  state_label: string
  count: number
  total_amount: number
}

export interface Journal {
  id: number
  name: string
  code: string
  type: JournalType
  active: boolean
}

export type JournalType = 
  | 'sale'      // Ventas
  | 'purchase'  // Compras
  | 'cash'      // Caja
  | 'bank'      // Banco
  | 'general'   // General

export interface InvoiceQueryParams {
  range?: TimeRange
  type?: InvoiceType | 'all'
  state?: InvoiceState | 'all'
  journal_id?: string
  page?: string
  limit?: string
}

export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface InvoiceTrend {
  period: string
  invoices: number
  refunds: number
  net_amount: number
  total_invoices_amount: number
  total_refunds_amount: number
}

export interface PaymentAnalysis {
  total_invoiced: number
  total_paid: number
  total_pending: number
  payment_rate: number
  avg_payment_days?: number
}

