"use client"

import { useEffect, useState } from "react"
import { 
  Card, 
  CardAction, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TrendingUpIcon, TrendingDownIcon, UsersIcon, TargetIcon, TrophyIcon } from "lucide-react"

interface SalesTeamStats {
  totalSalesmen: number
  currentMonthSales: number
  salesChange: number
  currentMonthInvoices: number
  currentMonthCustomers: number
  avgSalesPerSalesman: number
  topSalesman: {
    name: string
    sales: number
    invoices: number
    customers: number
  }
}

export default function SalesTeamStats() {
  const [stats, setStats] = useState<SalesTeamStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/sales-team-stats")
        const json = await res.json()
        
        if (json.success) {
          setStats(json.data)
        }
      } catch (error) {
        console.error("Error fetching sales team stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderBadge = (change: number) => {
    const isPositive = change >= 0
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon
    
    return (
      <Badge variant="outline">
        <Icon className="size-3.5" />
        {Math.abs(change).toFixed(1)}%
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
      {/* Ventas Totales del Mes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ventas del Mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(stats.currentMonthSales)}
          </CardTitle>
          <CardAction>
            {renderBadge(stats.salesChange)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.salesChange >= 0 ? 'Creciendo' : 'Disminuyendo'} este mes
            {stats.salesChange >= 0 ? 
              <TrendingUpIcon className="size-4 text-green-400" /> : 
              <TrendingDownIcon className="size-4 text-red-400" />}
          </div>
          <div className="text-muted-foreground">
            {stats.currentMonthInvoices} facturas emitidas
          </div>
        </CardFooter>
      </Card>

      {/* Vendedores Activos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vendedores Activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.totalSalesmen}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Equipo de ventas activo
            <UsersIcon className="size-4 text-blue-400" />
          </div>
          <div className="text-muted-foreground">
            Con ventas este mes
          </div>
        </CardFooter>
      </Card>

      {/* Top Vendedor */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top Vendedor</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums line-clamp-2">
            {stats.topSalesman.name}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCurrency(stats.topSalesman.sales)}
            <TrophyIcon className="size-4 text-yellow-500" />
          </div>
          <div className="text-muted-foreground">
            {stats.topSalesman.invoices} ventas • {stats.topSalesman.customers} clientes
          </div>
        </CardFooter>
      </Card>

      {/* Promedio por Vendedor */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Promedio por Vendedor</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(stats.avgSalesPerSalesman)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ventas promedio este mes
            <TargetIcon className="size-4 text-green-400" />
          </div>
          <div className="text-muted-foreground">
            Basado en {stats.totalSalesmen} vendedores
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}