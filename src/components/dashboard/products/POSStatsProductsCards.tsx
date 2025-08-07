// src/components/dashboard/pos/POSTopProductsStats.tsx
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
  Package,
  TrendingUp,
  Award,
  ShoppingBag
} from "lucide-react"

import type { POSTimeRange } from "@/types/pos"
import { usePOSTopProducts } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"

const POS_RANGE_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este año" }
]

const LIMIT_OPTIONS = [
  { value: "5", label: "Top 5" },
  { value: "10", label: "Top 10" },
  { value: "15", label: "Top 15" },
  { value: "20", label: "Top 20" }
]

export default function POSTopProductsStats() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [limit, setLimit] = useState<number>(10)
  const { data, loading, error, refetch } = usePOSTopProducts(range, limit)

  // Calcular el total para estadísticas
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity_sold, 0)
  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Productos más vendidos - Estadísticas
            </h2>
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

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
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Productos más vendidos - Estadísticas</h2>
            <p className="text-red-600">Error al cargar los datos</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refetch} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Productos más vendidos - Estadísticas
            </h2>
            <p className="text-muted-foreground">
              Métricas y ranking detallado - {data.length} productos
            </p>
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

            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value, 10))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Límite" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
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

        {data.length > 0 ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 @lg/main:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Producto #1</span>
                  </div>
                  <div className="text-lg font-bold text-yellow-600 mb-1">
                    {data[0]?.product_name.length > 30
                      ? data[0]?.product_name.substring(0, 30) + "..."
                      : data[0]?.product_name
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data[0]?.quantity_sold} unidades vendidas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Unidades</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{totalQuantity}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.length} productos diferentes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Valor Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount, "S/")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    En productos vendidos
                  </p>
                </CardContent>
              </Card>
            </div>
              {/* Lista detallada de productos */}
          
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay productos vendidos</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron ventas de productos para el período seleccionado
            </p>
          </div>
        )}
    </div>
  )
}