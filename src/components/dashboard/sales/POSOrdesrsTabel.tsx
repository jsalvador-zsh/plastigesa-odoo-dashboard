// src/components/dashboard/pos/POSOrdersTable.tsx
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
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RefreshCw,
  AlertCircle,
  SearchIcon,
  Receipt,
  CheckCircle,
  FileText,
  XCircle,
  CreditCard,
  ShoppingCart
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState, useMemo } from "react"

// Imports de tipos y hooks
import type { POSTimeRange, POSOrderState } from "@/types/pos"
import { usePOSOrders, usePOSSalespersons } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"

const LIMIT_OPTIONS = [
  { value: "10", label: "10 filas" },
  { value: "20", label: "20 filas" },
  { value: "50", label: "50 filas" },
  { value: "100", label: "100 filas" }
]

const POS_RANGE_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este año" }
]

export default function POSOrdersTable() {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("all")

  const { data, loading, error, totalPages, total, refetch } = usePOSOrders({
    range,
    page,
    limit,
    salesperson: selectedSalesperson
  })

  const { data: salespersons } = usePOSSalespersons()

  // Memoizar datos filtrados
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    return data.filter(order => 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.partner_name && order.partner_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.salesperson && order.salesperson.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [data, searchTerm])

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10))
    setPage(1)
  }

  const handleRangeChange = (value: string) => {
    setRange(value as POSTimeRange)
    setPage(1)
  }

  const handleSalespersonChange = (value: string) => {
    setSelectedSalesperson(value)
    setPage(1)
  }

  // Función para obtener badge del estado
  const getStateBadge = (orderState: POSOrderState) => {
    const stateConfig = {
      draft: { label: "Borrador", variant: "secondary" as const, icon: FileText },
      paid: { label: "Pagada", variant: "default" as const, icon: CreditCard },
      done: { label: "Completada", variant: "default" as const, icon: CheckCircle },
      invoiced: { label: "Facturada", variant: "default" as const, icon: Receipt },
      cancel: { label: "Cancelada", variant: "destructive" as const, icon: XCircle }
    }

    const config = stateConfig[orderState]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const renderPaginationButton = (pageNum: number, isActive: boolean = false) => (
    <PaginationItem key={pageNum}>
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={() => setPage(pageNum)}
        disabled={loading}
        className="w-10 h-10"
      >
        {pageNum}
      </Button>
    </PaginationItem>
  )

  if (loading && data.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Órdenes de Punto de Venta</CardTitle>
          <CardDescription>Cargando órdenes...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Órdenes de Punto de Venta</CardTitle>
          <CardDescription>Error al cargar las órdenes</CardDescription>
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
    <Card className="@container/card">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Órdenes de Punto de Venta
            </CardTitle>
            <CardDescription>
              {total} órdenes encontradas para el período seleccionado
            </CardDescription>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col @lg/card:flex-row gap-4 items-start @lg/card:items-center justify-between">
          <div className="flex flex-col @md/card:flex-row gap-2 @md/card:gap-4 w-full @lg/card:w-auto">
            <div className="relative flex-1 @lg/card:flex-initial">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por número, cliente o vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full @md/card:w-80"
              />
            </div>

            <div className="flex gap-2 @md/card:gap-4">
              <Select value={range} onValueChange={handleRangeChange}>
                <SelectTrigger className="w-[140px]">
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

              <Select value={selectedSalesperson} onValueChange={handleSalespersonChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vendedores</SelectItem>
                  {salespersons.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Mostrar" />
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
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredData.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Fecha</TableHead>
                    <TableHead className="text-center hidden @lg/card:table-cell">Vendedor</TableHead>
                    <TableHead className="text-center hidden @xl/card:table-cell">Productos</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden @lg/card:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden @xl/card:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredData.map((order, index) => (
                      <TableRow key={`${order.id}-${index}`} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.name}</span>
                            {order.salesperson && (
                              <span className="text-xs text-muted-foreground @lg/card:hidden">
                                {order.salesperson}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate font-medium" title={order.partner_name || 'Cliente General'}>
                            {order.partner_name || 'Cliente General'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStateBadge(order.state)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm">
                              {format(new Date(order.date_order), "dd MMM", { locale: es })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(order.date_order), "HH:mm", { locale: es })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center capitalize hidden @lg/card:table-cell">
                          <span className="text-sm">
                            {order.salesperson || "Sin asignar"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden @xl/card:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {order.lines_count} items
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold">
                            {formatCurrency(order.amount_total, "S/")}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Página {page} de {totalPages}</span>
                  <span>•</span>
                  <span>{total} registros totales</span>
                </div>

                <Pagination>
                  <PaginationContent className="flex items-center space-x-1">
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={page === 1 || loading}
                        className="w-10 h-10"
                      >
                        <ChevronsLeftIcon className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                        className="w-10 h-10"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    {/* Páginas */}
                    {(() => {
                      const pages = []
                      const maxVisiblePages = 5
                      let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1)
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(renderPaginationButton(i, i === page))
                      }

                      return pages
                    })()}

                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages || loading}
                        className="w-10 h-10"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages || loading}
                        className="w-10 h-10"
                      >
                        <ChevronsRightIcon className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No se encontraron resultados</h3>
            <p className="mt-2 text-muted-foreground">
              No hay órdenes que coincidan con "{searchTerm}"
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="mt-4"
            >
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay órdenes</h3>
            <p className="mt-2 text-muted-foreground">
              No se encontraron órdenes para el período seleccionado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}