// src/types/dashboard.ts

// Tipos base para parámetros comunes
export type TimeRange = "current_month" | "month" | "quarter" | "year"
export type TopLimit = "10" | "30" | "50"

// Tipos para clientes (como vienen de la DB)
export interface CustomerRaw {
  customer_name: string
  total_purchased: string // Viene como string de PostgreSQL
  invoice_count: string   // Facturas emitidas
  refund_count?: string   // Notas de crédito emitidas
  last_purchase: string
}

// Tipos para clientes (procesados)
export interface Customer {
  customer_name: string
  total_purchased: number // Monto neto (facturas - notas de crédito)
  invoice_count?: number  // Cantidad de facturas
  refund_count?: number   // Cantidad de notas de crédito
  last_purchase?: string
}

export interface CustomerQueryParams {
  range?: TimeRange
  limit?: TopLimit
  page?: string
}

// Tipos para respuestas API
export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PaginationMeta
  error?: string
}

export interface PaginationMeta {
  totalCustomers: number
  totalPages: number
  currentPage: number
  perPage: number
}

// Tipos para filtros comunes
export interface FilterOptions<T = string> {
  value: T
  label: string
}

// Tipos para configuración de gráficos
export interface ChartDataPoint {
  [key: string]: string | number
}

// Tipos para endpoints - usar el tipo nativo de pg
export interface DatabaseQueryResult<T> {
  rows: T[]
  rowCount: number | null
}

// Tipos para Odoo (extensible según necesidades)
export interface OdooAccountMove {
  id: number
  partner_id: number
  amount_total_signed: number
  invoice_date: string
  type: string
  state: string
}

export interface OdooResPartner {
  id: number
  name: string
}

// Tipos para configuración de queries
export interface QueryConfig {
  interval: string
  limit: number
  offset: number
  page: number
  perPage: number
}