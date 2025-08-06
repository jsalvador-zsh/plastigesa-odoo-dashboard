// src/types/stats.ts

import { TimeRange } from './dashboard'

export interface CustomerStats {
  totalCustomers: number
  totalCustomersChange: number
  topCustomer: {
    name: string
    amount: number
  }
  avgTicket: number
  newCustomers: number
  invoiceCount: number
  period: string // Para mostrar el período actual
}

export interface StatsQueryParams {
  range?: TimeRange
}

// Reutilizar el tipo TimeRange del dashboard
export type { TimeRange } from './dashboard'