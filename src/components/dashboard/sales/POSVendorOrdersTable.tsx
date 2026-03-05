// src/components/dashboard/sales/POSVendorOrdersTable.tsx
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
  User
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
interface POSVendorOrdersTableProps {
  selectedVendor?: string
  onVendorChange?: (vendor: string) => void
}
export default function POSVendorOrdersTable({ 
  selectedVendor, 
  onVendorChange 
}: POSVendorOrdersTableProps) {
  const [range, setRange] = useState<POSTimeRange>("today")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [vendor, setVendor] = useState<string>(selectedVendor || "all")
  const { data, loading, error, totalPages, total, refetch } = usePOSOrders({
    range,
    page,
    limit,
    salesperson: vendor
  })
  const { data: salespersons } = usePOSSalespersons()
  const handleVendorChange = (value: string) => {
    setVendor(value)
    setPage(1) // Reset página al cambiar vendedor
    if (onVendorChange) {
      onVendorChange(value)
    }
  }
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
    setLimit(parseInt(value))
    setPage(1) // Reset a primera página al cambiar límite
  }
  const handleRangeChange = (value: POSTimeRange) => {
    setRange(value)
    setPage(1) // Reset a primera página al cambiar rango
  }
  const getStateIcon = (state: POSOrderState) => {
    switch (state) {
      case "paid":
        return <CreditCard className="h-4 w-4" />
      case "done":
        return <CheckCircle className="h-4 w-4" />
      case "invoiced":
        return <FileText className="h-4 w-4" />
      case "cancel":
        return <XCircle className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }
  const getStateBadgeVariant = (state: POSOrderState): "default" | "secondary" | "destructive" | "outline" => {
    switch (state) {
      case "paid":
        return "default"
      case "done":
        return "secondary"
      case "invoiced":
        return "outline"
      case "cancel":
        return "destructive"
      default:
        return "outline"
    }
  }
  const getStateLabel = (state: POSOrderState): string => {
    const labels: Record<POSOrderState, string> = {
      draft: "Borrador",
      paid: "Pagado",
      done: "Finalizado",
      invoiced: "Facturado",
      cancel: "Cancelado"
    }
    return labels[state] || state
  }
  if (loading && !data.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Órdenes POS por Vendedor
              </CardTitle>
              <CardDescription>Cargando datos...</CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
            <Receipt className="h-5 w-5" />
            Órdenes POS por Vendedor
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Órdenes POS por Vendedor
            </CardTitle>
            <CardDescription>
              Listado de órdenes de punto de venta - {total} registros encontrados
            </CardDescription>
          </div>
          <Button onClick={refetch} variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros y controles */}
        <div className="flex flex-col @2xl/main:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por orden, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Selector de Vendedor */}
          <Select value={vendor} onValueChange={handleVendorChange}>
            <SelectTrigger className="w-full @2xl/main:w-48">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {salespersons.map((sp) => (
                <SelectItem key={sp} value={sp}>
                  {sp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Selector de período */}
          <Select value={range} onValueChange={(value) => handleRangeChange(value as POSTimeRange)}>
            <SelectTrigger className="w-full @2xl/main:w-40">
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
          {/* Selector de límite */}
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-full @2xl/main:w-32">
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
        </div>
        {/* Tabla */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Líneas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        {order.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={order.partner_name || 'Cliente General'}>
                        {order.partner_name || 'Cliente General'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {order.salesperson || 'Sin asignar'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.date_order), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.amount_total, "S/")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStateBadgeVariant(order.state)}>
                        <span className="flex items-center gap-1">
                          {getStateIcon(order.state)}
                          {getStateLabel(order.state)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.lines_count} {order.lines_count === 1 ? 'ítem' : 'ítems'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {searchTerm ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <SearchIcon className="h-8 w-8" />
                        <p>No se encontraron resultados para "{searchTerm}"</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Receipt className="h-8 w-8" />
                        <p>No hay órdenes para mostrar</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} registros
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(1)}
                    disabled={page === 1 || loading}
                  >
                    <ChevronsLeftIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm">
                    Página {page} de {totalPages}
                  </span>
                </div>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages || loading}
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
