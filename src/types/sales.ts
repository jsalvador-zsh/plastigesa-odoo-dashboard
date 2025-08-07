// src/types/sales.ts

import { TimeRange } from './dashboard'

export interface SaleOrder {
  id: number
  name: string // Número de cotización/orden
  partner_name: string
  date_order: string
  amount_total_mn: number
  state: SaleOrderState
  user_name?: string // Vendedor
  team_name?: string // Equipo de ventas
  validity_date?: string
  commitment_date?: string
}

export type SaleOrderState = 
  | 'draft'     // Borrador
  | 'sent'      // Cotización enviada
  | 'sale'      // Orden de venta (confirmada)
  | 'done'      // Finalizada
  | 'cancel'    // Cancelada

export interface SalesStats {
  totalQuotations: number
  confirmedSales: number
  conversionRate: number
  totalQuotationAmount: number
  totalSalesAmount: number
  avgQuotationAmount: number
  avgSaleAmount: number
  period: string
}

export interface SalesQueryParams {
  range?: TimeRange
  state?: SaleOrderState | 'all'
  page?: string
  limit?: string
  salesperson?: string
}

export interface SalesSummary {
  quotations: {
    count: number
    amount: number
    states: {
      draft: number
      sent: number
    }
  }
  sales: {
    count: number
    amount: number
    states: {
      sale: number
      done: number
    }
  }
  conversion: {
    rate: number
    lost: number
  }
}

export interface SalesEvolutionData {
  period: number
  total_orders: number
  total_amount: number
  avg_ticket: number
}

export interface TicketEvolutionData {
  period: number
  avg_ticket: number
  median_ticket: number
  min_ticket: number
  max_ticket: number
}

// Reutilizar el tipo TimeRange
export type { TimeRange } from './dashboard'