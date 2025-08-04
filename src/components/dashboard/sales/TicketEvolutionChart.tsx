"use client"

import { useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChartContainer } from "@/components/ui/chart"

interface AverageTicketData {
  period: string
  total_sales: number
  invoice_count: number
  average_ticket: number
  median_ticket: number
}

export default function AverageTicketChart() {
  const [range, setRange] = useState("month")
  const [data, setData] = useState<AverageTicketData[]>([])
  const [loading, setLoading] = useState(true)

  const rangeOptions = [
    { value: "month", label: "Mes" },
    { value: "quarter", label: "Trim." },
    { value: "year", label: "Año" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports/average-ticket?range=${range}`)
        const json = await res.json()
        
        if (json.success) {
          setData(json.data)
          console.log("Average ticket data:", json.data)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range])

  // Función para formatear valores en el tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Configuración del chart
  const chartConfig = {
    average_ticket: {
      label: "Ticket Promedio",
      color: "var(--chart-4)",
    },
    median_ticket: {
      label: "Ticket Mediano",
      color: "var(--primary)",
    },
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Período: <span className="font-bold text-foreground">{label}</span>
            </span>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-4" />
                <span className="text-sm font-medium">Ticket Promedio:</span>
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(data?.average_ticket || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">Ticket Mediano:</span>
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(data?.median_ticket || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t">
              <span className="text-xs text-muted-foreground">Facturas:</span>
              <span className="text-xs font-medium">
                {data?.invoice_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Total Ventas:</span>
              <span className="text-xs font-medium">
                {formatCurrency(data?.total_sales || 0)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Calcular estadísticas generales
  const stats = data.length > 0 ? {
    avgTicket: data.reduce((sum, d) => sum + d.average_ticket, 0) / data.length,
    totalInvoices: data.reduce((sum, d) => sum + d.invoice_count, 0),
    totalSales: data.reduce((sum, d) => sum + d.total_sales, 0),
    trend: data.length > 1 ? 
      ((data[data.length - 1].average_ticket - data[0].average_ticket) / data[0].average_ticket) * 100 : 0
  } : null

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Evolución del Ticket Promedio</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Cargando gráfico...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Evolución del Ticket Promedio</CardTitle>
        <CardDescription>
          Tendencia del valor promedio por transacción a lo largo del tiempo
        </CardDescription>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Ticket Promedio</p>
              <p className="text-sm font-bold">{formatCurrency(stats.avgTicket)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Facturas</p>
              <p className="text-sm font-bold">{stats.totalInvoices.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Ventas</p>
              <p className="text-sm font-bold">{formatCurrency(stats.totalSales)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Tendencia</p>
              <p className={`text-sm font-bold ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-4">
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(val) => val && setRange(val)}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            {rangeOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px] @[767px]/card:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rangeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`
                  }
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`
                  }
                  return value.toString()
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              <Line
                type="monotone"
                dataKey="average_ticket"
                stroke={chartConfig.average_ticket.color}
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                name={chartConfig.average_ticket.label}
              />
              <Line
                type="monotone"
                dataKey="median_ticket"
                stroke={chartConfig.median_ticket.color}
                strokeWidth={2}
                // strokeDasharray="5 5"
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name={chartConfig.median_ticket.label}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {data.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No hay datos para mostrar en el período seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  )
}