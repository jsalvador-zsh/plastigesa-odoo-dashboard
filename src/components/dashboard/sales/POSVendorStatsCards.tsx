// src/components/dashboard/sales/POSVendorStatsCards.tsx
"use client"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Receipt,
  Target,
  User
} from "lucide-react"
import type { POSTimeRange } from "@/types/pos"
import { usePOSVendorStats, usePOSSalespersons } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"
import { DatePickerWithRange } from "@/components/dashboard/overview/DatePickerWithRange"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
const POS_RANGE_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este año" },
  { value: "custom", label: "Personalizado" }
]
interface POSVendorStatsCardsProps {
  selectedVendor?: string
  onVendorChange?: (vendor: string) => void
}
export default function POSVendorStatsCards({
  selectedVendor,
  onVendorChange
}: POSVendorStatsCardsProps) {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [vendor, setVendor] = useState<string>(selectedVendor || "all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  })

  const { data: stats, loading, error, refetch } = usePOSVendorStats(
    range,
    vendor,
    range === 'custom' && dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    range === 'custom' && dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  )
  const { data: salespersons } = usePOSSalespersons()
  const handleVendorChange = (value: string) => {
    setVendor(value)
    if (onVendorChange) {
      onVendorChange(value)
    }
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Estadísticas por Vendedor POS</h2>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
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
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas por Vendedor POS</CardTitle>
            <CardDescription>Error al cargar los datos</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={refetch} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!stats) return null
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas por Vendedor POS</h2>
          <p className="text-muted-foreground">
            Resumen de ventas POS para {stats.period}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {range === 'custom' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          )}
          {/* Selector de vendedor */}
          <Select value={vendor} onValueChange={handleVendorChange}>
            <SelectTrigger className="w-48">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Seleccionar vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los vendedores</SelectItem>
              {salespersons.map((sp) => (
                <SelectItem key={sp} value={sp}>
                  {sp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Selector de período */}
          <Select value={range} onValueChange={(value) => setRange(value as POSTimeRange)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {POS_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={refetch} variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        {/* Total Ventas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Órdenes completadas
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalTransactions} transacciones
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Monto Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos totales
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalSales} órdenes
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Ticket Promedio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.avgTicket, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Por transacción
            </p>
            <div className="mt-2">
              {stats.avgTicket >= 100 ? (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Excelente
                </Badge>
              ) : stats.avgTicket >= 50 ? (
                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                  Bueno
                </Badge>
              ) : (
                <Badge className="text-xs bg-red-100 text-red-800">
                  Bajo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Clientes Únicos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Con identificación
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalCustomers > 0 ?
                  `${((stats.totalCustomers / stats.totalSales) * 100).toFixed(1)}% identificados` :
                  'Sin datos'
                }
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Transacciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Pagos procesados
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalSales === stats.totalTransactions ? 'Completas' : 'Pendientes'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
