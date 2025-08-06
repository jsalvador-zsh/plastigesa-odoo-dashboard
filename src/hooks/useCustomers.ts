// src/hooks/useCustomers.ts
import { useState, useEffect, useCallback } from "react"
import type { 
  Customer, 
  TimeRange, 
  TopLimit, 
  ApiResponse 
} from "@/types/dashboard"

interface UseCustomersParams {
  range: TimeRange
  limit: TopLimit
  page: number
}

interface UseCustomersReturn {
  data: Customer[]
  loading: boolean
  error: string | null
  totalPages: number
  refetch: () => void
}

export function useCustomers({ 
  range, 
  limit, 
  page 
}: UseCustomersParams): UseCustomersReturn {
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/reports/top-customers?range=${range}&limit=${limit}&page=${page}`
      )
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json: ApiResponse<Customer[]> = await res.json()
      
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
  }, [range, limit, page])

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