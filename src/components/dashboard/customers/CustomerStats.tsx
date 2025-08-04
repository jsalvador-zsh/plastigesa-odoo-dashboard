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
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface Stats {
  totalCustomers: number
  totalCustomersChange: number
  topCustomer: { name: string; amount: number }
  avgTicket: number
  newCustomers: number
  invoiceCount: number
}

export default function CustomerStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/customer-stats")
        const json = await res.json()
        
        if (json.success) {
          setStats(json.data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderBadge = (change: number) => {
    const isPositive = change >= 0
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon
    const variant = isPositive ? "positive" : "negative"
    
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
      {/* Clientes Totales */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.totalCustomers}
          </CardTitle>
          <CardAction>
            {renderBadge(stats.totalCustomersChange)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.totalCustomersChange >= 0 ? 'Creciendo' : 'Disminuyendo'} este mes
            {stats.totalCustomersChange >= 0 ? 
              <TrendingUpIcon className="size-4 text-green-400" /> : 
              <TrendingDownIcon className="size-4 text-red-400" />}
          </div>
          <div className="text-muted-foreground">
            Clientes registrados en total
          </div>
        </CardFooter>
      </Card>

      {/* Cliente Top */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cliente Top (mes)</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums line-clamp-2">
            {stats.topCustomer.name}
          </CardTitle>
          {/* <CardAction>
            {renderBadge(0)}
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCurrency(stats.topCustomer.amount)}
            <TrendingUpIcon className="size-4 text-green-400" />
          </div>
          <div className="text-muted-foreground">
            Mayor compra en el último mes
          </div>
        </CardFooter>
      </Card>

      {/* Ticket Promedio */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ticket Promedio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(stats.avgTicket)}
          </CardTitle>
          {/* <CardAction>
            {renderBadge(0)}
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Basado en {stats.invoiceCount} facturas
            <TrendingUpIcon className="size-4 text-green-400" />
          </div>
          <div className="text-muted-foreground">
            Promedio por factura
          </div>
        </CardFooter>
      </Card>

      {/* Clientes Nuevos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Nuevos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.newCustomers}
          </CardTitle>
          {/* <CardAction>
            {renderBadge(0)}
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Primer compra en últimos 15 días
            <TrendingUpIcon className="size-4 text-green-400" />
          </div>
          <div className="text-muted-foreground">
            Nuevos este mes
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}