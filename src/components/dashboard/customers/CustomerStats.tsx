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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TrendingUpIcon, TrendingDownIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TimeRange } from "@/types/dashboard"
import type { CustomerStats } from "@/types/stats"
import { formatCurrency } from "@/utils/chartUtils"

const RANGE_OPTIONS = [
  { value: "month", label: "Mes actual" },
  { value: "quarter", label: "Trimestre actual" },
  { value: "year", label: "Año actual" }
]

export default function CustomerStatsComponent() {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<TimeRange>("month")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/reports/customer-stats?range=${range}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const json = await res.json()
      
      if (json.success) {
        setStats(json.data)
      } else {
        throw new Error(json.error || "Error desconocido")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError(error instanceof Error ? error.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [range])

  const renderBadge = (change: number) => {
    const isPositive = change >= 0
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon
    
    return (
      <Badge variant="outline" className={isPositive ? "text-green-600" : "text-red-600"}>
        <Icon className="size-3.5 mr-1" />
        {Math.abs(change).toFixed(1)}%
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header con filtros */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Estadísticas de Clientes</h2>
            <p className="text-muted-foreground">
              Resumen de métricas clave
            </p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Estadísticas de Clientes</h2>
            <p className="text-red-600">Error al cargar los datos</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas de Clientes</h2>
          <p className="text-muted-foreground">
            Resumen de métricas para {stats.period}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={range} onValueChange={(value) => setRange(value as TimeRange)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Clientes Activos */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Clientes Activos (período)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {stats.totalCustomers.toLocaleString()}
            </CardTitle>
            <CardAction>
              {renderBadge(stats.totalCustomersChange)}
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {stats.totalCustomersChange >= 0 ? 'Creciendo' : 'Disminuyendo'} vs período anterior
              {stats.totalCustomersChange >= 0 ? 
                <TrendingUpIcon className="size-4 text-green-400" /> : 
                <TrendingDownIcon className="size-4 text-red-400" />}
            </div>
            <div className="text-muted-foreground">
              Clientes que compraron en {stats.period.toLowerCase()}
            </div>
          </CardFooter>
        </Card>

        {/* Cliente Top */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Cliente Top ({stats.period})</CardDescription>
            <CardTitle className="text-lg font-semibold line-clamp-2 min-h-[2.5rem]">
              {stats.topCustomer.name}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {formatCurrency(stats.topCustomer.amount, "S/")}
              <TrendingUpIcon className="size-4 text-green-400" />
            </div>
            <div className="text-muted-foreground">
              Mayor compra neta en {stats.period.toLowerCase()}
            </div>
          </CardFooter>
        </Card>

        {/* Ticket Promedio */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Ticket Promedio ({stats.period})</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {formatCurrency(stats.avgTicket, "S/")}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Basado en {stats.invoiceCount.toLocaleString()} facturas
              <TrendingUpIcon className="size-4 text-green-400" />
            </div>
            <div className="text-muted-foreground">
              Promedio por factura emitida
            </div>
          </CardFooter>
        </Card>

        {/* Clientes Nuevos */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Clientes Nuevos ({stats.period})</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {stats.newCustomers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Primera compra en {stats.period.toLowerCase()}
              <TrendingUpIcon className="size-4 text-green-400" />
            </div>
            <div className="text-muted-foreground">
              Nuevos clientes adquiridos
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}