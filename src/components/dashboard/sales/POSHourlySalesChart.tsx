// src/components/dashboard/pos/POSHourlySalesChart.tsx
"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts"

import { usePOSHourlySales } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"
import { ChartTooltip } from "@/components/ui/chart"

interface HourlyChartData {
  hour: number
  hour_label: string
  sales_count: number
  total_amount: number
  avg_ticket: number
}

const HOUR_COLORS = {
  morning: "var(--chart-2)",
  afternoon: "var(--chart-4)",
  evening: "#8B5CF6",
  night: "#6B7280",
}

const getHourColor = (hour: number): string => {
  if (hour >= 6 && hour < 12) return HOUR_COLORS.morning
  if (hour >= 12 && hour < 18) return HOUR_COLORS.afternoon
  if (hour >= 18 && hour < 22) return HOUR_COLORS.evening
  return HOUR_COLORS.night
}

const getHourPeriod = (hour: number): string => {
  if (hour >= 6 && hour < 12) return "Mañana"
  if (hour >= 12 && hour < 18) return "Tarde"
  if (hour >= 18 && hour < 22) return "Noche"
  return "Madrugada"
}

export default function POSHourlySalesChart() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const { data, loading, error, refetch } = usePOSHourlySales(selectedDate)

  // Procesar datos para el gráfico
  const chartData: HourlyChartData[] = data.map(item => ({
    ...item,
    hour_label: `${item.hour.toString().padStart(2, '0')}:00`,
    avg_ticket: item.sales_count > 0 ? item.total_amount / item.sales_count : 0
  }))

  // Calcular estadísticas
  const totalSales = data.reduce((sum, item) => sum + item.sales_count, 0)
  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0)
  const avgTicket = totalSales > 0 ? totalAmount / totalSales : 0
  const peakHour = data.reduce((max, item) => 
    item.sales_count > max.sales_count ? item : max, 
    { hour: 0, sales_count: 0, total_amount: 0 }
  )

  // Filtrar solo horas con ventas para mostrar el rango activo
  const activeHours = data.filter(item => item.sales_count > 0)
  const firstSale = activeHours.length > 0 ? Math.min(...activeHours.map(h => h.hour)) : 0
  const lastSale = activeHours.length > 0 ? Math.max(...activeHours.map(h => h.hour)) : 23

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">
            {label} ({getHourPeriod(data.hour)})
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Ventas:</span>{" "}
              <span className="font-medium text-blue-600">{data.sales_count}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Monto:</span>{" "}
              <span className="font-medium text-green-600">
                {formatCurrency(data.total_amount, "S/")}
              </span>
            </p>
            {data.sales_count > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">Ticket promedio:</span>{" "}
                <span className="font-medium text-purple-600">
                  {formatCurrency(data.avg_ticket, "S/")}
                </span>
              </p>
            )}
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
                <Clock className="h-5 w-5" />
                Ventas por Hora del Día
              </CardTitle>
              <CardDescription>Cargando datos...</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Clock className="h-5 w-5" />
            Ventas por Hora del Día
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
              <Clock className="h-5 w-5" />
              Ventas por Hora del Día
            </CardTitle>
            <CardDescription>
              Distribución horaria de ventas
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
                max={today}
              />
            </div>
            <Button onClick={refetch} variant="outline" size="default" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Periods Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: HOUR_COLORS.morning }}></div>
            <span className="text-xs">Mañana (6-12h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: HOUR_COLORS.afternoon }}></div>
            <span className="text-xs">Tarde (12-18h)</span>
          </div>
        </div>

        {/* Chart */}
        {totalSales > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}

              >
                <XAxis 
                  dataKey="hour_label" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                
                <Bar 
                  dataKey="sales_count" 
                  radius={8}
                  strokeWidth={1}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getHourColor(entry.hour)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Sin ventas registradas</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron ventas para la fecha seleccionada
            </p>
            <div className="mt-4">
              <Button
                onClick={() => setSelectedDate(today)}
                variant="outline"
              >
                Ver día actual
              </Button>
            </div>
          </div>
        )}

        {/* Activity Summary */}
        {activeHours.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Horario activo: {firstSale.toString().padStart(2, '0')}:00 - {lastSale.toString().padStart(2, '0')}:59 (Hora Lima)
              </span>
              <Badge variant="outline" className="text-xs">
                {activeHours.length}/24 horas con ventas
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}