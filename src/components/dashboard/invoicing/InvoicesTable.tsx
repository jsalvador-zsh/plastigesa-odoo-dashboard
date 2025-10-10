// src/components/dashboard/invoicing/InvoicesTable.tsx
"use client"

import { useState, useMemo } from "react"
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
  XCircle,
  Clock
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import type { TimeRange, InvoiceType, InvoiceState } from "@/types/invoice"
import { useInvoices } from "@/hooks/useInvoices"
import { formatCurrency } from "@/utils/chartUtils"

const LIMIT_OPTIONS = [
  { value: "20", label: "20 filas" },
  { value: "50", label: "50 filas" },
  { value: "100", label: "100 filas" }
]

const TIME_RANGE_OPTIONS = [
  { value: "week", label: "Última semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" }
]

const INVOICE_TYPE_OPTIONS = [
  { value: "all", label: "Todos los tipos" },
  { value: "out_invoice", label: "Facturas" },
  { value: "out_refund", label: "Notas de Crédito" }
]

const STATE_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "posted", label: "Publicado" },
  { value: "cancel", label: "Cancelado" }
]

export default function InvoicesTable() {
  const [range, setRange] = useState<TimeRange>("month")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterState, setFilterState] = useState<string>("all")

  const { data, loading, error, totalPages, total, refetch } = useInvoices({
    range,
    page,
    limit,
    type: filterType !== 'all' ? filterType as InvoiceType : undefined,
    state: filterState !== 'all' ? filterState as InvoiceState : undefined
  })

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    return data.filter(invoice => 
      invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const getTypeLabel = (typeCode?: string, type?: InvoiceType): string => {
    if (typeCode) {
      const codeLabels: Record<string, string> = {
        '01': 'Factura',
        '03': 'Boleta',
        '07': 'NC',
        '08': 'ND'
      }
      return codeLabels[typeCode] || typeCode
    }
    
    const labels: Record<InvoiceType, string> = {
      out_invoice: 'Factura',
      out_refund: 'NC',
      in_invoice: 'F. Proveedor',
      in_refund: 'NC Proveedor',
      entry: 'Asiento'
    }
    return labels[type!] || type || ''
  }

  const getPaymentBadge = (paymentState?: string) => {
    if (!paymentState) return null
    
    const variants = {
      paid: "default",
      not_paid: "destructive",
      partial: "outline",
      in_payment: "secondary"
    } as const
    
    const labels = {
      paid: "Pagado",
      not_paid: "No pagado",
      partial: "Parcial",
      in_payment: "En proceso"
    }
    
    const variant = variants[paymentState as keyof typeof variants] || "outline"
    const label = labels[paymentState as keyof typeof labels] || paymentState
    
    return <Badge variant={variant} className="text-xs">{label}</Badge>
  }

  const getStateIcon = (state: InvoiceState) => {
    switch (state) {
      case "posted": return <CheckCircle className="h-4 w-4" />
      case "cancel": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStateBadge = (state: InvoiceState, estadoElectronico?: string) => {
    // Si está anulado electrónicamente, mostrar como anulado
    if (estadoElectronico === '2_ANULADO') {
      return (
        <Badge variant="destructive">
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Anulado
          </span>
        </Badge>
      )
    }
    
    const variants = {
      draft: "outline",
      posted: "default",
      cancel: "destructive"
    } as const
    const labels = {
      draft: "Borrador",
      posted: "Publicado",
      cancel: "Cancelado"
    }
    return (
      <Badge variant={variants[state] || "outline"}>
        <span className="flex items-center gap-1">
          {getStateIcon(state)}
          {labels[state] || state}
        </span>
      </Badge>
    )
  }

  if (loading && !data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facturas y Documentos
          </CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
          <CardTitle>Facturas y Documentos</CardTitle>
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
              <FileText className="h-5 w-5" />
              Facturas y Documentos
            </CardTitle>
            <CardDescription>
              {total} documentos encontrados
            </CardDescription>
          </div>
          <Button onClick={refetch} variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col @2xl/main:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full @2xl/main:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-full @2xl/main:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
            <SelectTrigger className="w-full @2xl/main:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={limit.toString()} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
            <SelectTrigger className="w-full @2xl/main:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Impuesto</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{invoice.name}</span>
                        {invoice.sustento_nota && (
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={invoice.sustento_nota}>
                            {invoice.sustento_nota}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(invoice.invoice_type_code, invoice.move_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={invoice.partner_name}>
                        {invoice.partner_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.invoice_date ? format(new Date(invoice.invoice_date), "dd/MM/yyyy", { locale: es }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount_untaxed, "S/")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount_tax, "S/")}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(invoice.amount_total, "S/")}</TableCell>
                    <TableCell className="text-right">
                      <span className={invoice.amount_residual > 0 ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                        {formatCurrency(invoice.amount_residual, "S/")}
                      </span>
                    </TableCell>
                    <TableCell>{getPaymentBadge(invoice.payment_state)}</TableCell>
                    <TableCell>{getStateBadge(invoice.state, invoice.estado_comprobante_electronico)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No hay facturas para mostrar</p>
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
              Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page === 1}>
                    <ChevronsLeftIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm">Página {page} de {totalPages}</span>
                </div>
                <PaginationItem>
                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button variant="outline" size="icon" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
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

