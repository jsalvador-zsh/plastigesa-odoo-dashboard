// src/components/sales/SalesStatsCards.tsx
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
  FileText,
  CheckCircle,
  Percent,
  DollarSign
} from "lucide-react"

import type { TimeRange } from "@/types/sales"
import { useSalesStats } from "@/hooks/useSales"
import { formatCurrency, RANGE_OPTIONS } from "@/utils/chartUtils"

export default function SalesStatsCards() {
  const [range, setRange] = useState<TimeRange>("month")
  const { stats, loading, error, refetch } = useSalesStats({ range })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Estadísticas de Ventas</h2>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <CardTitle>Estadísticas de Ventas</CardTitle>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas de Ventas</h2>
          <p className="text-muted-foreground">
            Resumen de cotizaciones y ventas para {stats.period}
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
          
          <Button onClick={refetch} variant="outline" size="default" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        {/* Cotizaciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalQuotationAmount, "S/")} en total
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Prom: {formatCurrency(stats.avgQuotationAmount, "S/")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ventas Confirmadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedSales}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalSalesAmount, "S/")} en total
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Prom: {formatCurrency(stats.avgSaleAmount, "S/")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Conversión */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedSales} de {stats.totalQuotations + stats.confirmedSales} oportunidades
            </p>
            <div className="mt-2">
              {stats.conversionRate >= 30 ? (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Excelente
                </Badge>
              ) : stats.conversionRate >= 20 ? (
                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                  Buena
                </Badge>
              ) : (
                <Badge className="text-xs bg-red-100 text-red-800">
                  Mejorable
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Facturado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSalesAmount, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Solo ventas confirmadas
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.confirmedSales} órdenes
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalQuotationAmount + stats.totalSalesAmount, "S/")}
            </div>
            <p className="text-xs text-muted-foreground">
              Cotizaciones + Ventas
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.totalQuotations + stats.confirmedSales} oportunidades
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}