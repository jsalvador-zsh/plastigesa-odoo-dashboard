// src/types/inactiveCustomers.ts

export interface InactiveCustomer {
  customer_name: string
  phone?: string | null
  email?: string | null
  mobile?: string | null
  invoice_count: number
  total_purchased: number
  last_purchase: string | null
  days_since_last_purchase?: number
}

export interface InactiveCustomersQueryParams {
  page?: string
  limit?: string
  all?: string
  period?: string // 3 months, 6 months, 1 year
}

export interface InactiveCustomersMeta {
  total: number
  totalPages: number
  currentPage: number
  perPage: number
}

export type InactivityPeriod = "3_months" | "6_months" | "1_year"