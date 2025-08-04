"use client"

import { useEffect, useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

interface RawEntry {
  period: string
  type: "quote" | "invoice"
  total: number
}

interface ChartEntry {
  period: string
  quote: number
  invoice: number
}

export default function SalesVsQuotesChart() {
  const [range, setRange] = useState("month")
  const [data, setData] = useState<ChartEntry[]>([])

  const rangeOptions = [
    { value: "month", label: "Mes" },
    { value: "quarter", label: "Trim." },
    { value: "year", label: "Año" },
  ]

  // Configuración del chart con los colores y etiquetas correctas
  const chartConfig = {
    quote: {
      label: "Cotizaciones",
      color: "var(--chart-1)",
    },
    invoice: {
      label: "Facturas",
      color: "var(--chart-2)",
    },
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/reports/sales-vs-quotes?range=${range}`)
        const json = await res.json()
        if (json.success) {
          const raw: RawEntry[] = json.data

          // Agrupar datos por periodo
          const grouped: Record<string, ChartEntry> = {}
          raw.forEach(entry => {
            if (!grouped[entry.period]) {
              grouped[entry.period] = {
                period: entry.period,
                quote: 0,
                invoice: 0,
              }
            }
            grouped[entry.period][entry.type] = entry.total
          })

          // Convertir a array ordenado por periodo
          const sorted = Object.values(grouped).sort((a, b) =>
            a.period.localeCompare(b.period)
          )

          setData(sorted)
          console.log("Chart data:", sorted) // Debug
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }

    fetchData()
  }, [range])

  // Función personalizada para formatear valores en el tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Período
              </span>
              <span className="font-bold text-muted-foreground">
                {label}
              </span>
            </div>
          </div>
          <div className="grid gap-2 pt-2">
            {payload.map((entry: any, index: number) => {
              const config = chartConfig[entry.dataKey as keyof typeof chartConfig]
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-sm font-medium">
                    {config.label}:
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Cotizaciones vs Facturas</CardTitle>
        <CardDescription>
          Comparación mensual entre cotizaciones y facturas
        </CardDescription>
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
              <SelectValue placeholder="Seleccionar rango" />
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
               <defs>
              <linearGradient id="fillQuote" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInvoice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
              <CartesianGrid strokeDasharray="1 1" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
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
              <Area 
                type="natural" 
                dataKey="quote" 
                stackId="a" 
                stroke={chartConfig.quote.color}
                fill="url(#fillQuote)"
              />
              <Area 
                type="natural" 
                dataKey="invoice" 
                stackId="a" 
                stroke={chartConfig.invoice.color}
                fill="url(#fillInvoice)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}