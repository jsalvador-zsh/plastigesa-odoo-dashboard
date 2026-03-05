// src/hooks/useInvoices.ts
import { useState, useEffect } from 'react'
import type { 
  Invoice,
  InvoiceStats,
  InvoicesByType,
  InvoicesByJournal,
  InvoicesByState,
  Journal,
  InvoiceTrend,
  PaymentAnalysis,
  TimeRange,
  InvoiceType,
  InvoiceState
} from '@/types/invoice'
// Hook para estadísticas de facturación
export function useInvoiceStats(range: TimeRange = 'month', type?: InvoiceType) {
  const [data, setData] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ range })
      if (type) {
        params.append('type', type)
      }
      const response = await fetch(`/api/reports/invoice-stats?${params}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener estadísticas')
      }
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching invoice stats:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchStats()
  }, [range, type])
  return { data, loading, error, refetch: fetchStats }
}
// Hook para lista de facturas
export function useInvoices({
  range = 'month',
  page = 1,
  limit = 20,
  type,
  state,
  journalId
}: {
  range?: TimeRange
  page?: number
  limit?: number
  type?: InvoiceType
  state?: InvoiceState
  journalId?: number
} = {}) {
  const [data, setData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        range,
        page: page.toString(),
        limit: limit.toString(),
      })
      if (type) {
        params.append('type', type)
      }
      if (state) {
        params.append('state', state)
      }
      if (journalId) {
        params.append('journal_id', journalId.toString())
      }
      const response = await fetch(`/api/reports/invoices?${params}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener facturas')
      }
      setData(result.data || [])
      setTotalPages(result.meta?.totalPages || 1)
      setTotal(result.meta?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchInvoices()
  }, [range, page, limit, type, state, journalId])
  return { data, loading, error, totalPages, total, refetch: fetchInvoices }
}
// Hook para facturación por tipo
export function useInvoicesByType(range: TimeRange = 'month') {
  const [data, setData] = useState<InvoicesByType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports/invoices-by-type?range=${range}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener facturación por tipo')
      }
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching invoices by type:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [range])
  return { data, loading, error, refetch: fetchData }
}
// Hook para facturación por diario
export function useInvoicesByJournal(range: TimeRange = 'month') {
  const [data, setData] = useState<InvoicesByJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports/invoices-by-journal?range=${range}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener facturación por diario')
      }
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching invoices by journal:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [range])
  return { data, loading, error, refetch: fetchData }
}
// Hook para lista de diarios
export function useJournals() {
  const [data, setData] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchJournals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/reports/journals')
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener diarios')
      }
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching journals:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchJournals()
  }, [])
  return { data, loading, error, refetch: fetchJournals }
}
// Hook para tendencias de facturación
export function useInvoiceTrends(range: TimeRange = 'month') {
  const [data, setData] = useState<InvoiceTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports/invoice-trends?range=${range}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener tendencias')
      }
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching invoice trends:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [range])
  return { data, loading, error, refetch: fetchData }
}
// Hook para facturación por estado
export function useInvoicesByState(range: TimeRange = 'month') {
  const [data, setData] = useState<InvoicesByState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports/invoices-by-state?range=${range}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener facturación por estado')
      }
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching invoices by state:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [range])
  return { data, loading, error, refetch: fetchData }
}
