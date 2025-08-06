// src/types/purchases.ts

import { TimeRange } from './dashboard'

export interface LatestPurchase {
  customer_name: string
  invoice_number: string
  invoice_date: string
  amount_total_signed: number
  product_names?: string[]
  invoice_type?: 'out_invoice' | 'out_refund'
  state?: string
}

export interface LatestPurchasesQueryParams {
  limit?: string
  range?: TimeRange
}

// Reutilizar el tipo TimeRange
export type { TimeRange } from './dashboard'