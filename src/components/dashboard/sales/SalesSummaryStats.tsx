"use client"

import { useEffect, useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface SalesSummary {
  totalSales: number
  monthlyGrowth: number
  averageTicket: number
  newCustomers: number
  month: string
}

export default function SalesSummaryStats() {
  const [stats, setStats] = useState<SalesSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/sales-summary")
        const json = await res.json()

        if (json.success) {
          setStats(json.data)
        }
      } catch (error) {
        console.error("Error fetching sales summary:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderBadge = (value: number) => {
    const isPositive = value >= 0
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon

    return (
      <Badge variant="outline">
        <Icon className="size-3.5" />
        {Math.abs(value).toFixed(1)}%
      </Badge>
    )
  }
  if (loading || !stats) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }


  return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Ventas del Mes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ventas Totales ({stats.month})</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(stats.totalSales)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium flex gap-2">
            Ventas registradas este mes
          </div>
          <div className="text-muted-foreground">
            Incluye todas las facturas emitidas
          </div>
        </CardFooter>
      </Card>

      {/* Crecimiento mensual */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Crecimiento mensual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {renderBadge(stats.monthlyGrowth)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium flex gap-2">
            {stats.monthlyGrowth >= 0 ? 'Mejor que el mes anterior' : 'Por debajo del mes anterior'}
          </div>
          <div className="text-muted-foreground">
            Comparación entre {stats.month} y el mes anterior
          </div>
        </CardFooter>
      </Card>

      {/* Ticket promedio */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ticket promedio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(stats.averageTicket)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium flex gap-2">
            Promedio por cliente
          </div>
          <div className="text-muted-foreground">
            Basado en clientes facturados este mes
          </div>
        </CardFooter>
      </Card>

      {/* Clientes nuevos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes nuevos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.newCustomers}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium flex gap-2">
            Primer compra en {stats.month}
          </div>
          <div className="text-muted-foreground">
            Nuevos clientes que emitieron factura
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
