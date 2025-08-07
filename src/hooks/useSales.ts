// src/hooks/useSales.ts
import { useState, useEffect, useCallback } from "react"
import type { SaleOrder, SalesStats, SalesSummary, SaleOrderState, TimeRange } from "@/types/sales"

// Hook para órdenes de venta
interface UseSaleOrdersParams {
  range: TimeRange
  state: SaleOrderState | 'all'
  page: number
  limit: number
}

interface UseSaleOrdersReturn {
  data: SaleOrder[]
  loading: boolean
  error: string | null
  totalPages: number
  refetch: () => void
}

export function useSaleOrders({ 
  range, 
  state, 
  page, 
  limit 
}: UseSaleOrdersParams): UseSaleOrdersReturn {
  const [data, setData] = useState<SaleOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        range,
        state,
        page: page.toString(),
        limit: limit.toString()
      })

      const res = await fetch(`/api/reports/sale-orders?${params}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()
      
      if (json.success) {
        setData(json.data)
        setTotalPages(json.meta?.totalPages || 1)
      } else {
        throw new Error(json.error || "Error desconocido")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
      setData([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [range, state, page, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    totalPages,
    refetch: fetchData
  }
}

// Hook para estadísticas de ventas
interface UseSalesStatsParams {
  range: TimeRange
}

interface UseSalesStatsReturn {
  stats: SalesStats | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSalesStats({ range }: UseSalesStatsParams): UseSalesStatsReturn {
  const [stats, setStats] = useState<SalesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/reports/sales-stats?range=${range}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()
      
      if (json.success) {
        setStats(json.data)
      } else {
        throw new Error(json.error || "Error desconocido")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    stats,
    loading,
    error,
    refetch: fetchData
  }
}

// Hook para resumen de ventas
export function useSalesSummary({ range }: UseSalesStatsParams) {
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/reports/sales-summary?range=${range}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()
      
      if (json.success) {
        setSummary(json.data)
      } else {
        throw new Error(json.error || "Error desconocido")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar resumen")
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    summary,
    loading,
    error,
    refetch: fetchData
  }
}