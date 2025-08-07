// src/components/dashboard/pos/POSTopProductsRanking.tsx
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
  Medal,
  Trophy
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

export default function POSTopProductsRanking() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [limit, setLimit] = useState<number>(10)
  const { data, loading, error, refetch } = usePOSTopProducts(range, limit)

  // Calcular el total para porcentajes
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity_sold, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking de Productos
              </CardTitle>
              <CardDescription>Cargando datos...</CardDescription>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
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
            Ranking de Productos
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

  // Función para obtener el icono de posición
  const getPositionIcon = (position: number) => {
    if (position === 1) {
      return <Trophy className="w-5 h-5 text-yellow-600" />
    } else if (position === 2) {
      return <Medal className="w-5 h-5 text-gray-400" />
    } else if (position === 3) {
      return <Medal className="w-5 h-5 text-amber-600" />
    }
    return (
      <span className="font-bold text-lg text-muted-foreground w-5 h-5 flex items-center justify-center">
        {position}
      </span>
    )
  }

  // Función para obtener el color del badge según la posición
  const getBadgeVariant = (position: number) => {
    if (position === 1) return "default"
    if (position <= 3) return "secondary" 
    return "outline"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ranking de Productos
            </CardTitle>
            <CardDescription>
              Clasificación detallada por unidades vendidas
            </CardDescription>
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
      </CardHeader>

      <CardContent>
        {data.length > 0 ? (
          <>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {data.map((product, index) => {
                const position = index + 1
                const percentage = totalQuantity > 0 ? (product.quantity_sold / totalQuantity) * 100 : 0
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      position <= 3 ? 'bg-gradient-to-r from-muted/30 to-transparent border-primary/20' : ''
                    }`}
                  >
                    {/* Posición e Icono */}
                    <div className="flex items-center justify-center min-w-[2rem]">
                      {getPositionIcon(position)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Nombre del producto y badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm truncate" title={product.product_name}>
                          {product.product_name}
                        </p>
                        <Badge variant={getBadgeVariant(position)} className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                        {position <= 3 && (
                          <Badge variant="secondary" className="text-xs">
                            Top {position}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Métricas del producto */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Cantidad</span>
                          <span className="font-medium text-blue-600">
                            {product.quantity_sold} unidades
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Precio Prom.</span>
                          <span className="font-medium text-orange-600">
                            {formatCurrency(product.avg_price, "S/")}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Valor Total</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(product.total_amount, "S/")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumen del ranking */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Mostrando {data.length} productos</span>
                <span>Total: {totalQuantity.toLocaleString()} unidades vendidas</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay productos para mostrar</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron ventas de productos para el período seleccionado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}