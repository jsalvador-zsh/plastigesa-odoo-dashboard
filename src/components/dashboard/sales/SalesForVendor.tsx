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

interface RawEntry {
  period: string
  salesperson_id: number
  salesperson_name: string
  total: number
}

interface ChartEntry {
  period: string
  [key: string]: number | string // Para vendedores dinámicos
}

// Colores predefinidos para las líneas
const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
]

export default function SalesBySalespersonChart() {
  const [range, setRange] = useState("month")
  const [data, setData] = useState<ChartEntry[]>([])
  const [salespeople, setSalespeople] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const rangeOptions = [
    { value: "month", label: "Mens." },
    { value: "quarter", label: "Trim." },
    { value: "year", label: "Anual" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports/sales-by-salesperson?range=${range}`)
        const json = await res.json()
        
        if (json.success) {
          const raw: RawEntry[] = json.data

          // Obtener vendedores únicos
          const uniqueSalespeople = [...new Set(raw.map(entry => entry.salesperson_name))]
            .filter(name => name && name !== 'Sin Asignar')
            .sort()
          
          setSalespeople(uniqueSalespeople)

          // Agrupar datos por periodo
          const grouped: Record<string, ChartEntry> = {}
          
          raw.forEach(entry => {
            if (!grouped[entry.period]) {
              grouped[entry.period] = { period: entry.period }
              // Inicializar todos los vendedores en 0
              uniqueSalespeople.forEach(salesperson => {
                grouped[entry.period][salesperson] = 0
              })
            }
            
            if (entry.salesperson_name && entry.salesperson_name !== 'Sin Asignar') {
              grouped[entry.period][entry.salesperson_name] = entry.total
            }
          })

          // Convertir a array ordenado por periodo
          const sorted = Object.values(grouped).sort((a, b) =>
            (a.period as string).localeCompare(b.period as string)
          )

          setData(sorted)
          console.log("Chart data:", sorted)
          console.log("Salespeople:", uniqueSalespeople)
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

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Período: <span className="font-bold text-foreground">{label}</span>
            </span>
          </div>
          <div className="grid gap-2">
            {payload
              .sort((a: any, b: any) => b.value - a.value) // Ordenar por valor descendente
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {entry.dataKey}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatCurrency(entry.value)}
                  </span>
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
          <CardTitle>Ventas por Vendedor</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Cargando gráfico...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Ventas por Vendedor</CardTitle>
        <CardDescription>
          Evolución de ventas por vendedor a lo largo del tiempo
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
              <SelectValue placeholder="Seleccionar período" />
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
        <ChartContainer config={{}}>
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
              
              {salespeople.map((salesperson, index) => (
                <Line
                  key={salesperson}
                  type="monotone"
                  dataKey={salesperson}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {salespeople.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No hay datos de vendedores para mostrar
          </div>
        )}
      </CardContent>
    </Card>
  )
}