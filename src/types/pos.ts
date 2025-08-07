// src/types/pos.ts
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

export interface POSQueryParams {
  range?: POSTimeRange
  salesperson?: string
  page?: string
  limit?: string
  date?: string
}

export type POSOrderState = 'draft' | 'paid' | 'done' | 'invoiced' | 'cancel'
export type POSTimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year'