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
  SelectValue 
} from "@/components/ui/select"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RefreshCw,
  SearchIcon,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Imports de tipos y utilidades
import type { Customer, TimeRange, TopLimit } from "@/types/dashboard"
import { useCustomers } from "@/hooks/useCustomers"
import { 
  formatCurrency, 
  RANGE_OPTIONS, 
  LIMIT_OPTIONS,
  getCurrentPeriodDescription 
} from "@/utils/chartUtils"

export default function TopCustomersTable() {
  const [range, setRange] = useState<TimeRange>("month")
  const [limit, setLimit] = useState<TopLimit>("10")
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Usar el custom hook
  const { data, loading, error, totalPages, refetch } = useCustomers({
    range,
    limit,
    page
  })

  // Memoizar los datos filtrados para mejor performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    return data.filter(customer => 
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const handleLimitChange = (value: string) => {
    setLimit(value as TopLimit)
    setPage(1)
  }

  const handleRangeChange = (value: string) => {
    setRange(value as TimeRange)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    // No resetear página aquí porque el filtro es del lado cliente
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Clientes Destacados</CardTitle>
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
                  <Skeleton className="h-6 w-16" />
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
            <CardTitle>Clientes Destacados</CardTitle>
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
              <CardTitle>Clientes Destacados</CardTitle>
              <CardDescription>
                Los clientes con mayores compras en {getCurrentPeriodDescription(range).toLowerCase()}
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2 @md/main:items-end">
              <div className="flex gap-2">
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

                <Select value={limit} onValueChange={handleLimitChange}>
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
                  {data.length} clientes
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
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabla */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Facturas</TableHead>
                  <TableHead className="text-center hidden @md/card:table-cell">N° Crédito</TableHead>
                  <TableHead className="text-center">Última compra</TableHead>
                  <TableHead className="text-right">Total comprado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((customer, index) => (
                    <TableRow key={`${customer.customer_name}-${index}`} className="hover:bg-muted/50">
                      <TableCell className="max-w-[200px]">
                        <div className="truncate font-medium" title={customer.customer_name}>
                          {customer.customer_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {customer.invoice_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden @md/card:table-cell">
                        {customer.refund_count ? (
                          <Badge variant="destructive" className="text-xs">
                            {customer.refund_count}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm">
                          {customer.last_purchase
                            ? format(new Date(customer.last_purchase), "dd MMM yyyy", { locale: es })
                            : "Sin fecha"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(customer.total_purchased, "S/")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : searchTerm ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">No hay datos disponibles</p>
                          <p className="text-xs text-muted-foreground">
                            No se encontraron clientes en el período seleccionado
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
              Mostrando {filteredData.length} de {data.length} clientes 
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