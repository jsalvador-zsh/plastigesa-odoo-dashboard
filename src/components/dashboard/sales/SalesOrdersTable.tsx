// src/components/sales/SalesOrdersTable.tsx
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
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState, useMemo } from "react"

// Imports de tipos y hooks
import type { TimeRange, SaleOrderState } from "@/types/sales"
import { useSaleOrders } from "@/hooks/useSales"
import { formatCurrency, RANGE_OPTIONS } from "@/utils/chartUtils"

const LIMIT_OPTIONS = [
  { value: "10", label: "10 filas" },
  { value: "20", label: "20 filas" },
  { value: "50", label: "50 filas" },
  { value: "100", label: "100 filas" }
]

const STATE_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Cotización enviada" },
  { value: "sale", label: "Orden de venta" },
  { value: "done", label: "Finalizada" },
  { value: "cancel", label: "Cancelada" }
]

export default function SalesOrdersTable() {
  const [range, setRange] = useState<TimeRange>("month")
  const [state, setState] = useState<SaleOrderState | 'all'>("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

  const { data, loading, error, totalPages, refetch } = useSaleOrders({
    range,
    state,
    page,
    limit
  })

  // Memoizar datos filtrados
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    return data.filter(order => 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_name && order.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [data, searchTerm])

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10))
    setPage(1)
  }

  const handleRangeChange = (value: string) => {
    setRange(value as TimeRange)
    setPage(1)
  }

  const handleStateChange = (value: string) => {
    setState(value as SaleOrderState | 'all')
    setPage(1)
  }

  // Función para obtener badge del estado
  const getStateBadge = (orderState: SaleOrderState) => {
    const stateConfig = {
      draft: { label: "Borrador", variant: "secondary" as const, icon: FileText },
      sent: { label: "Enviada", variant: "outline" as const, icon: Send },
      sale: { label: "Confirmada", variant: "default" as const, icon: CheckCircle },
      done: { label: "Finalizada", variant: "default" as const, icon: CheckCircle },
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

  // Función para obtener descripción del período
  const getPeriodDescription = (range: TimeRange) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    switch (range) {
      case "month":
        return `${monthNames[currentMonth - 1]} ${currentYear}`
      case "quarter":
        const currentQuarter = Math.ceil(currentMonth / 3)
        return `Q${currentQuarter} ${currentYear}`
      case "year":
        return `${currentYear}`
      default:
        return `${monthNames[currentMonth - 1]} ${currentYear}`
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Órdenes de Venta
                </CardTitle>
                <CardDescription>Cargando datos...</CardDescription>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
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
              <FileText className="h-5 w-5" />
              Órdenes de Venta
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
                <FileText className="h-5 w-5" />
                Órdenes de Venta
              </CardTitle>
              <CardDescription>
                Cotizaciones y ventas en {getPeriodDescription(range)}
                {state !== 'all' && ` - ${STATE_OPTIONS.find(s => s.value === state)?.label}`}
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2 @md/main:items-end">
              <div className="flex gap-2 flex-wrap">
                <Select value={range} onValueChange={handleRangeChange}>
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

                <Select value={state} onValueChange={handleStateChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-fit">
                  {data.length} registros
                </Badge>
                {searchTerm && (
                  <Badge variant="secondary" className="w-fit">
                    {filteredData.length} filtrados
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabla */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-center hidden @lg/card:table-cell">Vendedor</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((order, index) => (
                    <TableRow key={`${order.id}-${index}`} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.name}</span>
                          {/* Mostrar vendedor en móvil */}
                          {order.user_name && (
                            <span className="text-xs text-muted-foreground @lg/card:hidden">
                              {order.user_name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate font-medium" title={order.partner_name}>
                          {order.partner_name}
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
                            {format(new Date(order.date_order), "yyyy", { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden @lg/card:table-cell">
                        <span className="text-sm">
                          {order.user_name || "Sin asignar"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(order.amount_total_mn, "S/")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : searchTerm ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <SearchIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">No se encontraron resultados</p>
                          <p className="text-xs text-muted-foreground">
                            Intenta con otro término de búsqueda
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">No hay órdenes disponibles</p>
                          <p className="text-xs text-muted-foreground">
                            No se encontraron órdenes en {getPeriodDescription(range)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && !searchTerm && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground hidden text-sm @lg/card:block">
                Mostrando página {page} de {totalPages} ({data.length} registros)
              </div>
              <Pagination className="w-full justify-between @lg/card:w-fit">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeftIcon className="size-4" />
                      <span className="sr-only">Primera página</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeftIcon className="size-4" />
                      <span className="sr-only">Anterior</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground px-2">
                      {page} / {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRightIcon className="size-4" />
                      <span className="sr-only">Siguiente</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      <ChevronsRightIcon className="size-4" />
                      <span className="sr-only">Última página</span>
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          {/* Mensaje de filtro activo */}
          {searchTerm && (
            <div className="text-center text-sm text-muted-foreground border-t pt-3">
              Mostrando {filteredData.length} de {data.length} órdenes 
              {filteredData.length < data.length && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="ml-2 p-0 h-auto"
                >
                  Limpiar filtro
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}