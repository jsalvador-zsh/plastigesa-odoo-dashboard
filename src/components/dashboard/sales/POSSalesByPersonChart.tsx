// src/components/dashboard/pos/POSSalesByPersonChart.tsx
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
  Users,
  TrendingUp,
  Crown,
  Target,
  BarChart3,
  Medal
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
  ReferenceLine
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

// Colores para vendedores
const SALESPERSON_COLORS = [
  "#3B82F6", // Azul
  "#10B981", // Verde
  "#F59E0B", // Amarillo
  "#EF4444", // Rojo
  "#8B5CF6", // Púrpura
  "#06B6D4", // Cian
  "#F97316", // Naranja
  "#84CC16", // Lima
  "#EC4899", // Rosa
  "#6B7280"  // Gris
]

interface ChartDataItem {
  salesperson: string
  total_sales: number
  total_amount: number
  avg_ticket: number
  percentage: number
  color: string
  short_name: string
}

export default function POSSalesByPersonChart() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const { data, loading, error, refetch } = usePOSSalesByPerson(range)

  // Calcular totales para porcentajes y promedios
  const totalSales = data.reduce((sum, item) => sum + item.total_sales, 0)
  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0)
  const avgTicketOverall = totalSales > 0 ? totalAmount / totalSales : 0

  // Preparar datos para el gráfico
  const chartData: ChartDataItem[] = data.map((item, index) => ({
    ...item,
    percentage: item.percentage, // Ya viene calculado del servicio
    color: SALESPERSON_COLORS[index % SALESPERSON_COLORS.length],
    short_name: item.salesperson.length > 12 
      ? item.salesperson.substring(0, 12) + "..." 
      : item.salesperson
  }))

  // Encontrar el mejor vendedor
  const topSalesperson = data.length > 0 ? data[0] : null

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">
            {data.salesperson}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ventas:</span>
              <span className="font-medium text-blue-600">{data.total_sales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.total_amount, "S/")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Participación:</span>
              <span className="font-medium text-purple-600">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ticket prom:</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(data.avg_ticket, "S/")}
              </span>
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
                <Users className="h-5 w-5" />
                Ventas por Vendedor
              </CardTitle>
              <CardDescription>Cargando datos...</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 @lg/main:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ventas por Vendedor
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ventas por Vendedor
            </CardTitle>
            <CardDescription>
              Comparativo de desempeño por vendedor - {data.length} vendedores activos
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
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
            
            <Button onClick={refetch} variant="outline" size="default" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {data.length > 0 ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 @lg/main:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Mejor Vendedor</span>
                  </div>
                  {topSalesperson && (
                    <>
                      <div className="text-lg font-bold text-yellow-600 mb-1">
                        {topSalesperson.salesperson}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {topSalesperson.total_sales} ventas • {topSalesperson.percentage.toFixed(1)}%
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
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
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Ticket Promedio</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(avgTicketOverall, "S/")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    General del equipo
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 @4xl/main:grid-cols-2 gap-6">
              {/* Gráfico de barras */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Ventas por Cantidad</h3>
                </div>
                
                {chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          type="number"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          type="category"
                          dataKey="short_name"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Línea de referencia para el promedio */}
                        {totalSales > 0 && (
                          <ReferenceLine 
                            x={totalSales / data.length} 
                            stroke="#ef4444" 
                            strokeDasharray="5 5"
                            strokeWidth={1}
                          />
                        )}
                        
                        <Bar 
                          dataKey="total_sales" 
                          radius={[0, 4, 4, 0]}
                          stroke="rgba(0,0,0,0.1)"
                          strokeWidth={1}
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay datos para mostrar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista detallada de vendedores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ranking Detallado</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {data.map((person, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {/* Posición con medalla */}
                        <div className="flex items-center justify-center w-8 h-8">
                          {index === 0 ? (
                            <Medal className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <span className="font-bold text-lg text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        {/* Indicador de color */}
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: SALESPERSON_COLORS[index % SALESPERSON_COLORS.length] }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate" title={person.salesperson}>
                            {person.salesperson}
                          </p>
                          <Badge 
                            variant={index === 0 ? "default" : "outline"} 
                            className="text-xs"
                          >
                            {person.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block font-medium text-blue-600">
                              {person.total_sales}
                            </span>
                            <span>ventas</span>
                          </div>
                          <div>
                            <span className="block font-medium text-green-600">
                              {formatCurrency(person.total_amount, "S/")}
                            </span>
                            <span>monto</span>
                          </div>
                          <div>
                            <span className="block font-medium text-orange-600">
                              {formatCurrency(person.avg_ticket, "S/")}
                            </span>
                            <span>ticket prom</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Análisis adicional */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 @md/main:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-muted-foreground">Promedio por vendedor</div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(totalSales / data.length)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-muted-foreground">Monto promedio</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(totalAmount / data.length, "S/")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-muted-foreground">Mejor ticket</div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(Math.max(...data.map(p => p.avg_ticket)), "S/")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-muted-foreground">Vendedores activos</div>
                  <div className="text-lg font-bold text-purple-600">
                    {data.length}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay datos de vendedores</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron ventas de vendedores para el período seleccionado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}