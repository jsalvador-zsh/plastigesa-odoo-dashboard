// src/components/sales/SalesEvolutionChart.tsx
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import {
  RefreshCw,
  AlertCircle,
  TrendingUp
} from "lucide-react"

import type { TimeRange } from "@/types/sales"
import { formatCurrency } from "@/utils/chartUtils"

interface EvolutionData {
  period: number
  total_orders: number
  total_amount: number
  avg_ticket: number
}

const RANGE_OPTIONS = [
  { value: "month", label: "Por día (mes actual)" },
  { value: "quarter", label: "Por semana (trimestre actual)" },
  { value: "year", label: "Por mes (año actual)" }
]

export default function SalesEvolutionChart() {
  const [data, setData] = useState<EvolutionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<TimeRange>("month")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/reports/sales-evolution?range=${range}`)
      
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

  // Custom tooltip para el gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">{formatXAxis(label)}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} style={{ color: entry.color }} className="text-sm">
                <span className="font-medium">{entry.name}: </span>
                {entry.dataKey.includes('amount') ? (
                  formatCurrency(entry.value, "S/")
                ) : (
                  `${entry.value} ${entry.dataKey.includes('orders') ? 'órdenes' : 'S/'}`
                )}
              </div>
            ))}
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
                <TrendingUp className="h-5 w-5" />
                Evolución de Ventas
              </CardTitle>
              <CardDescription>Cargando evolución...</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolución de Ventas
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
        <div className="flex flex-col gap-4 @md/card:flex-row @md/card:items-center @md/card:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolución de Ventas
            </CardTitle>
            <CardDescription>
              Ventas confirmadas por {range === 'month' ? 'día' : range === 'quarter' ? 'semana' : 'mes'}
            </CardDescription>
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
        <div className="h-[400px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value.toString()
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Area
                  type="monotone"
                  dataKey="total_amount"
                  stroke="var(--chart-1)"
                  fill="url(#salesGradient)"
                  name="Monto total"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="total_orders"
                  stroke="var(--chart-2)"
                  fill="url(#quotationsGradient)"
                  name="N° órdenes"
                  strokeWidth={2}
                />
              </AreaChart>
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