// src/hooks/usePOS.ts
import { useState, useEffect } from 'react'
import type { 
  POSStats, 
  POSOrder, 
  POSSalesPerson, 
  POSHourlySales, 
  POSProductRanking, 
  POSTimeRange 
} from '@/types/pos'

// Hook para estadísticas generales de POS
export function usePOSStats(range: POSTimeRange = 'today') {
  const [data, setData] = useState<POSStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/reports/pos-stats?range=${range}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener estadísticas')
      }
      
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching POS stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [range])

  return { data, loading, error, refetch: fetchStats }
}

// Hook para ventas por hora
export function usePOSHourlySales(date?: string) {
  const [data, setData] = useState<POSHourlySales[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHourlySales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (date) {
        params.append('date', date)
      }
      
      const response = await fetch(`/api/reports/pos-hourly-sales?${params}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener ventas por hora')
      }
      
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching POS hourly sales:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHourlySales()
  }, [date])

  return { data, loading, error, refetch: fetchHourlySales }
}

// Hook para productos más vendidos
export function usePOSTopProducts(range: POSTimeRange = 'today', limit: number = 10) {
  const [data, setData] = useState<POSProductRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/reports/pos-top-products?range=${range}&limit=${limit}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener productos más vendidos')
      }
      
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching POS top products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopProducts()
  }, [range, limit])

  return { data, loading, error, refetch: fetchTopProducts }
}

// Hook para lista de vendedores
export function usePOSSalespersons() {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSalespersons = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/reports/pos-salespersons')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener lista de vendedores')
      }
      
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching POS salespersons:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalespersons()
  }, [])

  return { data, loading, error, refetch: fetchSalespersons }
}

// Hook para órdenes de POS
export function usePOSOrders({
  range = 'today',
  page = 1,
  limit = 10,
  salesperson
}: {
  range?: POSTimeRange
  page?: number
  limit?: number
  salesperson?: string
} = {}) {
  const [data, setData] = useState<POSOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        range,
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (salesperson && salesperson !== 'all') {
        params.append('salesperson', salesperson)
      }
      
      const response = await fetch(`/api/reports/pos-orders?${params}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener órdenes')
      }
      
      setData(result.data || [])
      setTotalPages(result.meta?.totalPages || 1)
      setTotal(result.meta?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching POS orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [range, page, limit, salesperson])

  return { data, loading, error, totalPages, total, refetch: fetchOrders }
}

// Hook para ventas por vendedor
export function usePOSSalesByPerson(range: POSTimeRange = 'today') {
  const [data, setData] = useState<POSSalesPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSalesByPerson = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/reports/pos-sales-by-person?range=${range}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener ventas por vendedor')
      }
      
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching POS sales by person:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesByPerson()
  }, [range])

  return { data, loading, error, refetch: fetchSalesByPerson }
}