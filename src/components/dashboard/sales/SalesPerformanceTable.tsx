"use client"

import { useEffect, useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUpIcon, TrendingDownIcon, TrophyIcon } from "lucide-react"

interface SalesmanPerformance {
  name: string
  sales: number
  invoices: number
  customers: number
  avgTicket: number
}

export default function SalesPerformanceTable() {
  const [data, setData] = useState<SalesmanPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/sales-team-stats")
        const json = await res.json()
        
        if (json.success) {
          setData(json.data.salesmenRanking)
        }
      } catch (error) {
        console.error("Error fetching sales performance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcular promedios para comparación
  const avgSales = data.reduce((sum, item) => sum + item.sales, 0) / data.length
  const avgTicketOverall = data.reduce((sum, item) => sum + item.avgTicket, 0) / data.length

  const getPerformanceBadge = (value: number, average: number, isHigherBetter: boolean = true) => {
    const isAboveAverage = isHigherBetter ? value > average : value < average
    
    if (Math.abs(value - average) / average < 0.1) {
      return <Badge variant="outline">Promedio</Badge>
    }
    
    return (
      <Badge variant={isAboveAverage ? "default" : "outline"} className={isAboveAverage ? "bg-green-100 text-green-800 border-green-300" : ""}>
        {isAboveAverage ? (
          <>
            <TrendingUpIcon className="size-3 mr-1" />
            Sobre promedio
          </>
        ) : (
          <>
            <TrendingDownIcon className="size-3 mr-1" />
            Bajo promedio
          </>
        )}
      </Badge>
    )
  }

  const getRanking = (index: number) => {
    if (index === 0) return <TrophyIcon className="size-4 text-yellow-500" />
    if (index === 1) return <TrophyIcon className="size-4 text-gray-400" />
    if (index === 2) return <TrophyIcon className="size-4 text-orange-500" />
    return <span className="text-muted-foreground">#{index + 1}</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Detallada</CardTitle>
        <CardDescription>Métricas completas y comparativas por vendedor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Ranking</th>
                <th className="text-left p-3 font-medium">Vendedor</th>
                <th className="text-right p-3 font-medium">Ventas</th>
                <th className="text-center p-3 font-medium">Performance</th>
                <th className="text-right p-3 font-medium">Facturas</th>
                <th className="text-right p-3 font-medium">Clientes</th>
                <th className="text-right p-3 font-medium">Ticket Promedio</th>
                <th className="text-center p-3 font-medium">Ticket Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((salesman, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    index === 0 ? 'bg-yellow-50/50 dark:bg-yellow-950/20' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center justify-center w-8">
                      {getRanking(index)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">
                      {salesman.name}
                      {index === 0 && (
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                          Top Performer
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-mono font-semibold">
                      {formatCurrency(salesman.sales)}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {getPerformanceBadge(salesman.sales, avgSales)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium">
                      {salesman.invoices}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium">
                      {salesman.customers}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-mono">
                      {formatCurrency(salesman.avgTicket)}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {getPerformanceBadge(salesman.avgTicket, avgTicketOverall)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Resumen estadístico */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Ventas Promedio</div>
              <div className="text-lg font-semibold">{formatCurrency(avgSales)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Ticket Promedio General</div>
              <div className="text-lg font-semibold">{formatCurrency(avgTicketOverall)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Vendedores</div>
              <div className="text-lg font-semibold">{data.length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}