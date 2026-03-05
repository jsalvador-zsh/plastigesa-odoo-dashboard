// src/components/dashboard/sales/POSVendorRanking.tsx
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
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  AlertCircle,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  User
} from "lucide-react"
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
const getMedalIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-orange-600" />
    default:
      return <span className="text-lg font-bold text-muted-foreground">{position}</span>
  }
}
const getMedalColor = (position: number) => {
  switch (position) {
    case 1:
      return "bg-yellow-50 border-yellow-200"
    case 2:
      return "bg-gray-50 border-gray-200"
    case 3:
      return "bg-orange-50 border-orange-200"
    default:
      return "bg-background"
  }
}
export default function POSVendorRanking() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const { data, loading, error, refetch } = usePOSSalesByPerson(range)
  // Tomar solo los top 5 vendedores
  const topVendors = data.slice(0, 5)
  const maxAmount = topVendors.length > 0 ? topVendors[0].total_amount : 0
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top 5 Vendedores
              </CardTitle>
              <CardDescription>Cargando ranking...</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top 5 Vendedores
          </CardTitle>
          <CardDescription>Error al cargar el ranking</CardDescription>
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
              <Trophy className="h-5 w-5" />
              Top 5 Vendedores
            </CardTitle>
            <CardDescription>
              Ranking de mejores vendedores por monto
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
      <CardContent className="space-y-4">
        {topVendors.length > 0 ? (
          topVendors.map((vendor, index) => {
            const position = index + 1
            const progressPercentage = maxAmount > 0 ? (vendor.total_amount / maxAmount) * 100 : 0
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getMedalColor(position)}`}
              >
                <div className="flex items-start gap-3">
                  {/* Posición / Medalla */}
                  <div className="flex items-center justify-center w-10 h-10 shrink-0">
                    {getMedalIcon(position)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Nombre y badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h4 className="font-semibold truncate" title={vendor.salesperson}>
                          {vendor.salesperson}
                        </h4>
                      </div>
                      <Badge variant={position === 1 ? "default" : "outline"} className="ml-2 shrink-0">
                        {vendor.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    {/* Estadísticas en grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Ventas</div>
                        <div className="font-semibold text-blue-600">
                          {vendor.total_sales}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Monto</div>
                        <div className="font-semibold text-green-600 truncate" title={formatCurrency(vendor.total_amount, "S/")}>
                          {formatCurrency(vendor.total_amount, "S/")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Ticket Prom</div>
                        <div className="font-semibold text-orange-600 truncate" title={formatCurrency(vendor.avg_ticket, "S/")}>
                          {formatCurrency(vendor.avg_ticket, "S/")}
                        </div>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="space-y-1">
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Rendimiento relativo</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay datos de ranking</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No se encontraron ventas para el período seleccionado
            </p>
          </div>
        )}
        {/* Indicador de más vendedores */}
        {data.length > 5 && (
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Y {data.length - 5} vendedor{data.length - 5 !== 1 ? 'es' : ''} más
              <TrendingUp className="inline-block h-4 w-4 ml-1" />
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
