// src/components/dashboard/sales/POSVendorPerformanceChart.tsx
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
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  ShoppingCart
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend
} from "recharts"

import type { POSTimeRange } from "@/types/pos"
import { usePOSSalesByPerson } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"

const POS_RANGE_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este año" }
]

const VENDOR_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#F97316", "#84CC16", "#EC4899", "#6B7280"
]

type ChartType = "bar" | "pie"

export default function POSVendorPerformanceChart() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [chartType, setChartType] = useState<ChartType>("bar")
  const { data, loading, error, refetch } = usePOSSalesByPerson(range)

  // Preparar datos para los gráficos
  const chartData = data.map((item, index) => ({
    ...item,
    color: VENDOR_COLORS[index % VENDOR_COLORS.length],
    short_name: item.salesperson.length > 15 
      ? item.salesperson.substring(0, 15) + "..." 
      : item.salesperson
  }))

  // Calcular totales
  const totalSales = data.reduce((sum, item) => sum + item.total_sales, 0)
  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0)
  const avgTicket = totalSales > 0 ? totalAmount / totalSales : 0

  // Custom tooltip para gráfico de barras
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{data.salesperson}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ventas:</span>
              <span className="font-medium text-blue-600">{data.total_sales}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.total_amount, "S/")}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ticket prom:</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(data.avg_ticket, "S/")}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Participación:</span>
              <span className="font-medium text-purple-600">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom tooltip para gráfico de pastel
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{data.salesperson}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.total_amount, "S/")}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-muted-foreground">Participación:</span>
              <span className="font-medium text-purple-600">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rendimiento por Vendedor
              </CardTitle>
              <CardDescription>Cargando datos...</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rendimiento por Vendedor
          </CardTitle>
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rendimiento por Vendedor
            </CardTitle>
            <CardDescription>
              Comparativo de desempeño - {data.length} vendedores
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Barras
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Pastel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

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
      </CardHeader>

      <CardContent className="space-y-6">
        {data.length > 0 ? (
          <>
            {/* Estadísticas resumidas */}
            <div className="grid grid-cols-1 @md/main:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Ventas</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    Entre {data.length} vendedores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Monto Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount, "S/")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ingresos acumulados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Ticket Promedio</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(avgTicket, "S/")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    General del equipo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico principal */}
            {chartType === "bar" ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="short_name"
                      stroke="#64748b"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    
                    <Bar 
                      dataKey="total_sales" 
                      radius={[8, 8, 0, 0]}
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth={1}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData}
                      dataKey="total_amount"
                      nameKey="salesperson"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ percentage }) => `${percentage.toFixed(1)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-sm">{entry.payload.salesperson}</span>
                      )}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Tabla de rendimiento detallado */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2">
                <h3 className="font-semibold">Detalle de Rendimiento</h3>
              </div>
              <div className="divide-y">
                {data.map((vendor, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: VENDOR_COLORS[index % VENDOR_COLORS.length] }}
                        />
                        <span className="font-medium">{vendor.salesperson}</span>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 @md/main:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ventas</span>
                        <div className="font-semibold text-blue-600">
                          {vendor.total_sales}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monto</span>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(vendor.total_amount, "S/")}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ticket Prom</span>
                        <div className="font-semibold text-orange-600">
                          {formatCurrency(vendor.avg_ticket, "S/")}
                        </div>
                        {vendor.avg_ticket > avgTicket ? (
                          <TrendingUp className="h-3 w-3 text-green-600 inline ml-1" />
                        ) : vendor.avg_ticket < avgTicket ? (
                          <TrendingDown className="h-3 w-3 text-red-600 inline ml-1" />
                        ) : null}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Participación</span>
                        <div className="font-semibold text-purple-600">
                          {vendor.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay datos disponibles</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron ventas para el período seleccionado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

