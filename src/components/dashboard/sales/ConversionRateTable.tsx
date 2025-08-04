"use client"

import { useEffect, useState } from "react"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ConversionData {
  period: string
  quotes_count: number
  quotes_total: number
  invoices_count: number
  invoices_total: number
  conversion_rate_count: number
  conversion_rate_value: number
}

export default function ConversionRateTable() {
  const [range, setRange] = useState("month")
  const [data, setData] = useState<ConversionData[]>([])
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
        const res = await fetch(`/api/reports/conversion-rate?range=${range}`)
        const json = await res.json()

        if (json.success) {
          // Ordenar por período descendente para mostrar los más recientes primero
          const sortedData = json.data.sort((a: ConversionData, b: ConversionData) =>
            b.period.localeCompare(a.period)
          )
          setData(sortedData)
          console.log("Conversion rate data:", sortedData)
        }
      } catch (error) {
        console.error("Error fetching conversion data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range])

  // Función para formatear valores en moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Función para obtener el color del badge según la tasa de conversión
  const getConversionBadge = (rate: number, type: 'count' | 'value') => {
    let variant: "default" | "secondary" | "destructive" = "default"
    let icon = <Minus className="h-3 w-3" />

    if (rate >= 70) {
      variant = "default"
      icon = <TrendingUp className="h-3 w-3" />
    } else if (rate >= 50) {
      variant = "secondary"

      icon = <Minus className="h-3 w-3" />
    } else {
      variant = "destructive"
      icon = <TrendingDown className="h-3 w-3" />
    }

    return (
      <Badge variant={variant} className={`flex items-center gap-1`}>
        {icon}
        {rate.toFixed(1)}%
      </Badge>

    )
  }

  // Calcular estadísticas generales
  const stats = data.length > 0 ? {
    avgConversionCount: data.reduce((sum, d) => sum + d.conversion_rate_count, 0) / data.length,
    avgConversionValue: data.reduce((sum, d) => sum + d.conversion_rate_value, 0) / data.length,
    totalQuotes: data.reduce((sum, d) => sum + d.quotes_count, 0),
    totalInvoices: data.reduce((sum, d) => sum + d.invoices_count, 0),
    totalQuotesValue: data.reduce((sum, d) => sum + d.quotes_total, 0),
    totalInvoicesValue: data.reduce((sum, d) => sum + d.invoices_total, 0),
  } : null

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Tasa de Conversión</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Cargando tabla...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tasa de Conversión</CardTitle>
        <CardDescription>
          Porcentaje de cotizaciones que se convierten en facturas
        </CardDescription>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Conv. Promedio (Cant.)</p>
              <p className="text-sm font-bold">{stats.avgConversionCount.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Conv. Promedio (Valor)</p>
              <p className="text-sm font-bold">{stats.avgConversionValue.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Cotizaciones</p>
              <p className="text-sm font-bold">{stats.totalQuotes.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Facturas</p>
              <p className="text-sm font-bold">{stats.totalInvoices.toLocaleString()}</p>
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

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Período</TableHead>
                <TableHead className="text-center font-semibold">Valor Cotizaciones</TableHead>
                <TableHead className="text-center font-semibold">Valor Facturas</TableHead>
                <TableHead className="font-semibold">Conv. Cantidad</TableHead>
                <TableHead className="font-semibold">Conv. Valor</TableHead>
                <TableHead className="text-right font-semibold">Monto Cotizado</TableHead>
                <TableHead className="text-right font-semibold">Monto Facturado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.period} className={index % 2 === 0 ? "bg-muted/2" : ""}>
                  <TableCell className="font-medium">{row.period}</TableCell>
                  <TableCell className="text-center mx-auto">
                    {row.quotes_count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.invoices_count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {getConversionBadge(row.conversion_rate_count, 'count')}
                  </TableCell>
                  <TableCell className="text-center">
                    {getConversionBadge(row.conversion_rate_value, 'value')}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.quotes_total)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.invoices_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No hay datos para mostrar en el período seleccionado
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p><strong>Nota:</strong> La tasa de conversión se calcula comparando las cotizaciones y facturas del mismo período.</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="h-5">
                <TrendingUp className="h-3 w-3" />
              </Badge>
              <span>Excelente (≥70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5">
                <Minus className="h-3 w-3" />
              </Badge>
              <span>Bueno (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="h-5">
                <TrendingDown className="h-3 w-3" />
              </Badge>
              <span>Necesita mejora (&lt;50%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}