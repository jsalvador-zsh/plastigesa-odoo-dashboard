// src/hooks/useLatestPurchases.ts
import { useState, useEffect, useCallback } from "react"
import type { LatestPurchase, TimeRange } from "@/types/purchases"

interface UseLatestPurchasesParams {
  limit?: number
  range?: TimeRange
  mode?: 'period' | 'recent' // 'period' usa filtro de período, 'recent' muestra las más recientes
}

interface UseLatestPurchasesReturn {
  data: LatestPurchase[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useLatestPurchases({ 
  limit = 10, 
  range = "month",
  mode = "recent"
}: UseLatestPurchasesParams = {}): UseLatestPurchasesReturn {
  const [data, setData] = useState<LatestPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        mode
      })
      
      if (mode === 'period') {
        params.append('range', range)
      }

      const res = await fetch(`/api/reports/latest-purchases?${params}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()
      
      if (json.success) {
        setData(json.data)
      } else {
        throw new Error(json.error || "Error desconocido")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [limit, range, mode])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}