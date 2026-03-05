// src/components/dashboard/invoicing/InvoiceStatsCards.tsx
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
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calculator
} from "lucide-react"
import type { TimeRange } from "@/types/invoice"
import { useInvoiceStats } from "@/hooks/useInvoices"
import { formatCurrency } from "@/utils/chartUtils"
const TIME_RANGE_OPTIONS = [
  { value: "week", label: "Última semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este año" },
  { value: "all", label: "Todo" }
]
export default function InvoiceStatsCards() {
  const [range, setRange] = useState<TimeRange>("month")
  const { data: stats, loading, error, refetch } = useInvoiceStats(range)
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Estadísticas de Facturación</h2>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
            <CardTitle>Estadísticas de Facturación</CardTitle>
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
  const paymentRate = stats.totalAmount > 0 ? (stats.totalPaid / stats.totalAmount) * 100 : 0
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas de Facturación</h2>
          <p className="text-muted-foreground">
            Resumen general para {stats.period}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(value) => setRange(value as TimeRange)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={refetch} variant="outline" size="default" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-6">
        {/* Total Facturas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Documentos emitidos
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalCanceled} canceladas
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Monto Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalAmount, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Facturación neta
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalInvoices} docs
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Monto Pagado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Pagado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalPaid, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Cobrado efectivamente
            </p>
            <div className="mt-2">
              <Badge className="text-xs bg-green-100 text-green-800">
                {paymentRate.toFixed(1)}% cobrado
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Monto Pendiente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalPending, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Por cobrar
            </p>
            <div className="mt-2">
              <Badge className="text-xs bg-orange-100 text-orange-800">
                {(100 - paymentRate).toFixed(1)}% pendiente
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Facturas Canceladas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalCanceled}</div>
            <p className="text-xs text-muted-foreground">
              Documentos anulados
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalInvoices > 0 ? ((stats.totalCanceled / stats.totalInvoices) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        {/* Ticket Promedio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.avgInvoiceAmount, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Por documento
            </p>
            <div className="mt-2">
              {stats.avgInvoiceAmount >= 1000 ? (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Alto
                </Badge>
              ) : stats.avgInvoiceAmount >= 500 ? (
                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                  Medio
                </Badge>
              ) : (
                <Badge className="text-xs bg-gray-100 text-gray-800">
                  Bajo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
