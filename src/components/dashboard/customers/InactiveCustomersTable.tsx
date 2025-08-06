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
  Download,
  RefreshCw,
  AlertCircle,
  SearchIcon,
  UserX,
  Clock,
  Mail,
  MessageSquare,
  Phone
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState, useMemo } from "react"

// Imports de tipos y hooks
import type { InactivityPeriod } from "@/types/inactive"
import { useInactiveCustomers } from "@/hooks/useInactiveCustomers"
import { formatCurrency, formatPhone, getWhatsAppLink } from "@/utils/chartUtils"

const LIMIT_OPTIONS = [
  { value: "10", label: "10 filas" },
  { value: "30", label: "30 filas" },
  { value: "50", label: "50 filas" },
  { value: "100", label: "100 filas" }
]

const PERIOD_OPTIONS = [
  { value: "3_months", label: "3 meses" },
  { value: "6_months", label: "6 meses" },
  { value: "1_year", label: "1 año" }
]

export default function InactiveCustomersTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [period, setPeriod] = useState<InactivityPeriod>("3_months")
  const [searchTerm, setSearchTerm] = useState("")

  const { 
    data, 
    loading, 
    error, 
    totalPages, 
    refetch, 
    exportToExcel, 
    exporting 
  } = useInactiveCustomers({ page, limit, period })

  // Memoizar datos filtrados
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    return data.filter(customer => 
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10))
    setPage(1)
  }

  const handlePeriodChange = (value: string) => {
    setPeriod(value as InactivityPeriod)
    setPage(1)
  }

  const formatDaysAgo = (days: number) => {
    if (days < 30) return `${days} días`
    if (days < 365) return `${Math.floor(days / 30)} meses`
    return `${Math.floor(days / 365)} años`
  }

  const getPeriodDescription = (period: InactivityPeriod) => {
    const descriptions = {
      "3_months": "3 meses",
      "6_months": "6 meses",
      "1_year": "1 año"
    }
    return descriptions[period]
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
                  <UserX className="h-5 w-5" />
                  Clientes Inactivos
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
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Clientes Inactivos
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
                <UserX className="h-5 w-5" />
                Clientes Inactivos
              </CardTitle>
              <CardDescription>
                Clientes sin compras en los últimos {getPeriodDescription(period)}
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2 @md/main:items-end">
              <div className="flex gap-2">
                <Select 
                  value={period} 
                  onValueChange={handlePeriodChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período inactividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={limit.toString()} 
                  onValueChange={handleLimitChange}
                >
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
                  onClick={exportToExcel}
                  variant="default"
                  disabled={exporting || data.length === 0}
                >
                  {exporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {exporting ? "Exportando..." : "Excel"}
                </Button>

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabla */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center hidden @md/card:table-cell">Contacto</TableHead>
                  <TableHead className="text-center">Facturas</TableHead>
                  <TableHead className="text-center">Última compra</TableHead>
                  <TableHead className="text-center hidden @lg/card:table-cell">Días sin comprar</TableHead>
                  <TableHead className="text-right">Total histórico</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((customer, index) => {
                    const phone = formatPhone(
                      customer.phone ?? null,
                      customer.mobile ?? null
                    )
                    const whatsappLink = getWhatsAppLink(phone, customer.customer_name)
                    
                    return (
                      <TableRow key={`${customer.customer_name}-${index}`} className="hover:bg-muted/50">
                        <TableCell className="max-w-[200px]">
                          <div className="space-y-1">
                            <div className="truncate font-medium" title={customer.customer_name}>
                              {customer.customer_name}
                            </div>
                            {/* Mostrar contacto en móvil */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground @md/card:hidden">
                              {phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{phone}</span>
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[120px]">{customer.email}</span>
                                </div>
                              )}
                            </div>
                            {/* Mostrar días sin comprar en móvil */}
                            <div className="text-xs text-muted-foreground @lg/card:hidden flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {customer.days_since_last_purchase ? 
                                formatDaysAgo(customer.days_since_last_purchase) : 
                                "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Columna de contacto - visible en tablet+ */}
                        <TableCell className="text-center hidden @md/card:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            {phone && (
                              <div className="flex items-center gap-2">
                                {whatsappLink ? (
                                  <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                                    title="Enviar WhatsApp"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="text-xs">{phone}</span>
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span className="text-xs">{phone}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {customer.email && (
                              <a
                                href={`mailto:${customer.email}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                title="Enviar email"
                              >
                                <Mail className="h-4 w-4" />
                                <span className="text-xs truncate max-w-[100px]">{customer.email}</span>
                              </a>
                            )}
                            {!phone && !customer.email && (
                              <span className="text-xs text-muted-foreground">Sin contacto</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {customer.invoice_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm">
                              {customer.last_purchase
                                ? format(new Date(customer.last_purchase), "dd MMM", { locale: es })
                                : "Sin fecha"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {customer.last_purchase
                                ? format(new Date(customer.last_purchase), "yyyy", { locale: es })
                                : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden @lg/card:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {customer.days_since_last_purchase ? 
                                formatDaysAgo(customer.days_since_last_purchase) : 
                                "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold">
                            {formatCurrency(customer.total_purchased, "S/")}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
                        <UserX className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">¡Excelente!</p>
                          <p className="text-xs text-muted-foreground">
                            No hay clientes inactivos en este período
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