// src/components/dashboard/pos/POSTopProductsChart.tsx
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LabelList,
} from "recharts"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { ChevronLeftIcon, ChevronRightIcon, RefreshCw, AlertCircle, Package } from "lucide-react"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { POSTimeRange } from "@/types/pos"
import { usePOSTopProducts } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"

const POS_RANGE_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trim." },
  { value: "year", label: "Año" }
]

const LIMIT_OPTIONS = [
  { value: "5", label: "Top 5" },
  { value: "10", label: "Top 10" },
  { value: "15", label: "Top 15" },
  { value: "20", label: "Top 20" }
]

// Función para formatear nombre de producto
function formatProductName(name: string, maxLength: number = 15): string {
  return name.length > maxLength ? name.slice(0, maxLength) + "..." : name
}

// Función para obtener descripción del período
function getPeriodDescription(range: POSTimeRange): string {
  const now = new Date()
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  switch (range) {
    case "today":
      return `Hoy ${now.getDate()} de ${monthNames[now.getMonth()]}`
    case "week":
      return "Esta semana"
    case "month":
      return `${monthNames[now.getMonth()]} ${now.getFullYear()}`
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3) + 1
      return `Q${quarter} ${now.getFullYear()}`
    case "year":
      return `${now.getFullYear()}`
    default:
      return `Hoy ${now.getDate()} de ${monthNames[now.getMonth()]}`
  }
}

// Validar datos del gráfico
function validateChartData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false
  }
  
  return data.every(item => {
    const hasName = typeof item.product_name === 'string' && item.product_name.length > 0
    const hasQuantity = typeof item.quantity_sold === 'number' && 
                       !isNaN(item.quantity_sold) && 
                       item.quantity_sold >= 0
    
    return hasName && hasQuantity
  })
}

export default function POSTopProductsChart() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [limit, setLimit] = useState<number>(10)
  const [page, setPage] = useState(1)
  
  const { data, loading, error, refetch } = usePOSTopProducts(range, limit)

  // Simular paginación en frontend ya que la API no tiene paginación
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10))
    setPage(1)
  }

  const handleRangeChange = (value: string | POSTimeRange) => {
    setRange(value as POSTimeRange)
    setPage(1)
  }

  const chartConfig: ChartConfig = {
    quantity_sold: {
      color: "hsl(var(--chart-1))",
      label: "Cantidad vendida por producto",
    },
  }

  // Loading state
  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Más Vendidos
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Más Vendidos
          </CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={refetch} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Validar datos del gráfico
  const isValidData = validateChartData(paginatedData)

  return (
    <div className="space-y-4">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Más Vendidos
          </CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Los productos con más unidades vendidas en {getPeriodDescription(range).toLowerCase()}
            </span>
            <span className="@[540px]/card:hidden">
              Período: {getPeriodDescription(range)}
            </span>
          </CardDescription>
          <CardAction>
            <div className="flex flex-col items-center md:flex-row gap-4">
              <ToggleGroup
                type="single"
                value={range}
                onValueChange={handleRangeChange}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
              >
                {POS_RANGE_OPTIONS.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value}>
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <Select value={range} onValueChange={handleRangeChange}>
                <SelectTrigger
                  className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                  size="sm"
                  aria-label="Seleccionar rango"
                >
                  <SelectValue placeholder="Seleccionar rango" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {POS_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="rounded-lg">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Top" />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                disabled={loading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {isValidData ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                data={paginatedData}
                width={800}
                height={400}>
                <XAxis
                  dataKey="product_name"
                  tickMargin={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatProductName(value)}
                />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const product = props.payload
                        const quantity = product?.quantity_sold || 0
                        const totalAmount = product?.total_amount || 0
                        const avgPrice = product?.avg_price || 0
                        
                        return [
                          `${quantity} unidades`,
                          <div key="details" className="text-xs text-muted-foreground mt-1">
                            <div>Valor total: {formatCurrency(totalAmount, "S/")}</div>
                            <div>Precio promedio: {formatCurrency(avgPrice, "S/")}</div>
                          </div>
                        ]
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="quantity_sold"
                  fill={chartConfig.quantity_sold.color}
                  radius={8}
                >
                  <LabelList
                    dataKey="quantity_sold"
                    position="top"
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: any) => `${value}`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No hay datos disponibles para mostrar</p>
                <p className="text-sm">Intenta cambiar los filtros o el rango de tiempo</p>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-4 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => page > 1 && setPage(page - 1)}
                    aria-disabled={page === 1}
                    className="cursor-pointer"
                  >
                    <ChevronLeftIcon />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => page < totalPages && setPage(page + 1)}
                    aria-disabled={page === totalPages}
                    className="cursor-pointer"
                  >
                    <ChevronRightIcon />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
}