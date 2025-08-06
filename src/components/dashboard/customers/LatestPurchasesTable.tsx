"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  RefreshCw,
  AlertCircle,
  ShoppingCart,
  Receipt,
  RotateCcw
} from "lucide-react"

// Imports de tipos y hooks
import type { TimeRange } from "@/types/purchases"
import { useLatestPurchases } from "@/hooks/useLatestPurchases"
import { formatCurrency, RANGE_OPTIONS, getCurrentPeriodDescription } from "@/utils/chartUtils"

const LIMIT_OPTIONS = [
  { value: "5", label: "Últ. 5" },
  { value: "10", label: "Últ. 10" },
  { value: "20", label: "Últ. 20" },
  { value: "50", label: "Últ. 50" }
]

export default function LatestPurchasesTable() {
  const [limit, setLimit] = useState(10)
  const [range, setRange] = useState<TimeRange>("month")
  const [mode, setMode] = useState<'period' | 'recent'>("recent")

  const { data, loading, error, refetch } = useLatestPurchases({
    limit,
    range,
    mode
  })

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Últimas Compras
                </CardTitle>
                <CardDescription>Cargando datos...</CardDescription>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Últimas Compras
            </CardTitle>
            <CardDescription>Error al cargar los datos</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="@container/card">
        <CardHeader>
          <div className="flex flex-col gap-4 @md/main:flex-row @md/main:items-start @md/main:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Últimas Compras
              </CardTitle>
              <CardDescription>
                {mode === 'recent' ? (
                  `${data.length} compras más recientes (últimos 30 días)`
                ) : (
                  `${data.length} compras en ${getCurrentPeriodDescription(range).toLowerCase()}`
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2 @md/main:items-end">
              <div className="flex gap-2">
                {mode === 'period' && (
                  <Select value={range} onValueChange={(value) => setRange(value as TimeRange)}>
                    <SelectTrigger className="w-[140px]">
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
                )}

                <Select 
                  value={limit.toString()} 
                  onValueChange={(value) => setLimit(parseInt(value, 10))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Cantidad" />
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
                  size="default"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-fit">
                  {data.length} registros
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden @md/card:table-cell">Factura</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-center hidden @lg/card:table-cell">Tipo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((purchase, index) => (
                    <TableRow key={`${purchase.invoice_number}-${index}`} className="hover:bg-muted/50">
                      <TableCell className="max-w-[200px]">
                        <div className="truncate font-medium" title={purchase.customer_name}>
                          {purchase.customer_name}
                        </div>
                        {/* Mostrar número de factura en móvil */}
                        <div className="text-xs text-muted-foreground @md/card:hidden">
                          {purchase.invoice_number}
                        </div>
                      </TableCell>
                      <TableCell className="hidden @md/card:table-cell">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {purchase.invoice_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm">
                          {purchase.invoice_date
                            ? format(new Date(purchase.invoice_date), "dd MMM", { locale: es })
                            : "Sin fecha"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden @lg/card:table-cell">
                        {purchase.invoice_type === 'out_refund' ? (
                          <Badge variant="destructive" className="text-xs">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Nota
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            <Receipt className="h-3 w-3 mr-1" />
                            Factura
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-semibold ${
                            purchase.invoice_type === 'out_refund' 
                              ? 'text-red-600' 
                              : 'text-foreground'
                          }`}>
                            {purchase.invoice_type === 'out_refund' ? '-' : ''}
                            {formatCurrency(Math.abs(purchase.amount_total_signed), "S/")}
                          </span>
                          {/* Mostrar tipo en móvil */}
                          <span className="text-xs text-muted-foreground @lg/card:hidden">
                            {purchase.invoice_type === 'out_refund' ? 'Nota crédito' : 'Factura'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">No hay compras disponibles</p>
                          <p className="text-xs text-muted-foreground">
                            {mode === 'recent' 
                              ? "No se encontraron compras en los últimos 30 días"
                              : `No se encontraron compras en ${getCurrentPeriodDescription(range).toLowerCase()}`
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}