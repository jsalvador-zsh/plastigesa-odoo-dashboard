"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react"

export function DailySalesTable() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-sales-detail', page],
    queryFn: () => fetch(`/api/reports/daily-sales/detail?page=${page}&limit=${limit}`).then(res => res.json())
  })

  if (error) return <div>Error al cargar datos</div>

  const sales = data?.data || []
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 }

  return (
    <Card>
      <div className="space-y-4 px-6">
        <h2 className="text-lg font-semibold mb-4">Detalle de Ventas</h2>
        
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : sales.length > 0 ? (
                sales.map((sale:any) => (
                  <TableRow key={sale.invoice_number}>
                    <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell>
                      {format(new Date(sale.invoice_date), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sale.items.slice(0, 3).map((item: { product_name: string; quantity: number }, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {item.product_name} (x{item.quantity})
                          </Badge>
                        ))}
                        {sale.items.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{sale.items.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      S/ {Number(sale.amount_total_signed).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron ventas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <div className="text-muted-foreground hidden text-sm lg:block">
              Mostrando página {page} de {meta.totalPages}
            </div>
            <Pagination className="w-full justify-between lg:w-fit">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
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
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                  >
                    <ChevronLeftIcon className="size-4" />
                      <span className="sr-only">Anterior</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                    <span className="text-sm text-muted-foreground">
                      Página {page} de {meta.totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                      disabled={page === meta.totalPages}
                    >
                      <ChevronRightIcon className="size-4" />
                      <span className="sr-only">Siguiente</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(meta.totalPages)}
                      disabled={page === meta.totalPages}
                    >
                      <ChevronsRightIcon className="size-4" />
                      <span className="sr-only">Última página</span>
                    </Button>
                  </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Card>
  )
}