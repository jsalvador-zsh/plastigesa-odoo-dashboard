// src/hooks/useInactiveCustomers.ts
import { useState, useEffect, useCallback } from "react"
import type { InactiveCustomer, InactivityPeriod } from "@/types/inactive"

interface UseInactiveCustomersParams {
  page: number
  limit: number
  period: InactivityPeriod
}

interface UseInactiveCustomersReturn {
  data: InactiveCustomer[]
  loading: boolean
  error: string | null
  totalPages: number
  refetch: () => void
  exportToExcel: () => Promise<void>
  exporting: boolean
}

export function useInactiveCustomers({ 
  page, 
  limit, 
  period 
}: UseInactiveCustomersParams): UseInactiveCustomersReturn {
  const [data, setData] = useState<InactiveCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [exporting, setExporting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/reports/inactive-customers?page=${page}&limit=${limit}&period=${period}`
      )
      
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
  }, [page, limit, period])

  const exportToExcel = useCallback(async () => {
    try {
      setExporting(true)
      
      const res = await fetch(`/api/reports/inactive-customers?all=true&period=${period}`)
      const json = await res.json()

      if (!json.success) {
        throw new Error("Error al exportar datos")
      }

      // Verificar si tenemos datos
      if (!json.data || json.data.length === 0) {
        throw new Error("No hay datos para exportar")
      }

      // Usar importación dinámica con try-catch más específico
      let XLSX, saveAs
      
      try {
        // Importar XLSX
        const xlsxModule = await import('xlsx')
        XLSX = xlsxModule.default || xlsxModule
        
        // Importar file-saver
        const fileSaverModule = await import('file-saver')
        saveAs = fileSaverModule.saveAs || fileSaverModule.default.saveAs
        
      } catch (importError) {
        console.error("Error importing libraries:", importError)
        throw new Error("Error al cargar las librerías de exportación. Verifica que estén instaladas: npm install xlsx file-saver")
      }

      // Preparar datos para Excel
      const exportData = json.data.map((item: InactiveCustomer) => ({
        Cliente: item.customer_name,
        "Teléfono": item.phone || item.mobile || "Sin teléfono",
        "Email": item.email || "Sin email",
        "Cantidad de Facturas": item.invoice_count,
        "Total Comprado (S/.)": item.total_purchased,
        "Última Compra": item.last_purchase
          ? new Date(item.last_purchase).toLocaleDateString('es-PE')
          : "Sin fecha",
        "Días sin Comprar": item.days_since_last_purchase || 0
      }))

      // Crear worksheet y workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes Inactivos")
      
      // Generar buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      })
      
      // Crear blob y descargar
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
      const filename = `clientes_inactivos_${period}_${new Date().toISOString().split('T')[0]}.xlsx`
      
      saveAs(blob, filename)
      
    } catch (error) {
      console.error("Error al generar Excel:", error)
      setError(error instanceof Error ? error.message : "Error al exportar a Excel")
    } finally {
      setExporting(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    totalPages,
    refetch: fetchData,
    exportToExcel,
    exporting
  }
}