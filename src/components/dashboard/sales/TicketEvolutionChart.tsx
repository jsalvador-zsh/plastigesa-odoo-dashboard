// src/components/sales/TicketEvolutionChart.tsx
"use client"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts"
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import type { TimeRange } from "@/types/sales"
import { formatCurrency } from "@/utils/chartUtils"
interface TicketData {
  period: number
  avg_ticket: number
  median_ticket: number
  min_ticket: number
  max_ticket: number
}
const RANGE_OPTIONS = [
  { value: "month", label: "Por día (mes actual)" },
  { value: "quarter", label: "Por semana (trimestre actual)" },
  { value: "year", label: "Por mes (año actual)" }
]
export default function TicketEvolutionChart() {
  const [data, setData] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<TimeRange>("month")
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/reports/ticket-evolution?range=${range}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        throw new Error(json.error || "Error desconocido")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
      setData([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [range])
  // Formatear el label del eje X según el rango de tiempo
  const formatXAxis = (period: number) => {
    if (range === "month") return `Día ${period}`
    if (range === "quarter") return `Sem ${period}`
    return new Date(0, period - 1).toLocaleString('es', { month: 'short' })
  }
  // Calcular promedio general y tendencia
  const avgTicket = data.length > 0 
    ? data.reduce((sum, item) => sum + item.avg_ticket, 0) / data.length 
    : 0
  const latestTicket = data.length > 0 ? data[data.length - 1]?.avg_ticket : 0
  const previousTicket = data.length > 1 ? data[data.length - 2]?.avg_ticket : 0
  const ticketTrend = previousTicket > 0 ? ((latestTicket - previousTicket) / previousTicket) * 100 : 0
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-2">{formatXAxis(label)}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} style={{ color: entry.color }} className="text-sm">
                <span className="font-medium">{entry.name}: </span>
                {formatCurrency(entry.value, "S/")}
              </div>
            ))}
            {data && (
              <div className="text-xs text-muted-foreground border-t pt-1 space-y-1">
                <div>Mínimo: {formatCurrency(data.min_ticket, "S/")}</div>
                <div>Máximo: {formatCurrency(data.max_ticket, "S/")}</div>
                <div>Mediana: {formatCurrency(data.median_ticket, "S/")}</div>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }
  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evolución del Ticket Promedio
              </CardTitle>
              <CardDescription>Cargando evolución...</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolución del Ticket Promedio
          </CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchData} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-4 @md/card:flex-row @md/card:items-start @md/card:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolución del Ticket Promedio
            </CardTitle>
            <CardDescription>
              Tendencia del valor promedio por orden de venta
            </CardDescription>
            {/* Métricas rápidas */}
            <div className="flex items-center gap-4 pt-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Promedio general: </span>
                <span className="font-medium">{formatCurrency(avgTicket, "S/")}</span>
              </div>
              <div className="flex items-center gap-1">
                {ticketTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <Badge 
                  variant={ticketTrend >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {ticketTrend >= 0 ? '+' : ''}{ticketTrend.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={range} onValueChange={(value) => setRange(value as TimeRange)}>
              <SelectTrigger className="w-48">
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
            <Button onClick={fetchData} variant="outline" size="default" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatXAxis}
                />
                <YAxis 
                  fontSize={12}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `S/ ${(value / 1000).toFixed(0)}K`
                    return `S/ ${value}`
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {/* Línea de referencia del promedio */}
                <ReferenceLine 
                  y={avgTicket} 
                  stroke="#6b7280" 
                  strokeDasharray="5 5"
                  label={{ value: "Promedio", position: "insideTopRight" }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_ticket"
                  stroke="var(--chart-3)"
                  strokeWidth={3}
                  dot={{ fill: "var(--chart-3)", strokeWidth: 2, r: 2 }}
                  activeDot={{ r: 2, stroke: "var(--chart-3)", strokeWidth: 2 }}
                  name="Ticket Promedio"
                />
                <Line
                  type="monotone"
                  dataKey="median_ticket"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-4)", strokeWidth: 2, r: 2 }}
                  activeDot={{ r: 2, stroke: "var(--chart-4)", strokeWidth: 2 }}
                  name="Mediana"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No hay datos disponibles para el período seleccionado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}