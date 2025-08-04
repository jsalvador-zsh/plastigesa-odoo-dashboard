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
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


interface Customer {
  customer_name: string
  invoice_count: number
  total_purchased: number
  last_purchase: string
}

export default function TopCustomersTable() {
  const [data, setData] = useState<Customer[]>([])
  const [range, setRange] = useState("month")
  const [limit, setLimit] = useState("10")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `/api/reports/top-customers?range=${range}&limit=${limit}&page=${page}`
      )
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setTotalPages(json.meta.totalPages)
      }
    }

    fetchData()
  }, [range, limit, page])

  const handleLimitChange = (value: string) => {
    setLimit(value)
    setPage(1)
  }

  const handleRangeChange = (value: string) => {
    setRange(value)
    setPage(1)
  }

  const filteredData = data.filter(customer => 
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Card className="@container/card">
        <div className="flex flex-col gap-4 px-6">
          <div className="flex flex-col gap-4 @md/main:flex-row @md/main:items-center @md/main:justify-between">
            <div className="flex flex-col gap-2 @md/main:flex-row @md/main:items-center @md/main:gap-4">
              <h2 className="text-lg font-semibold">Clientes Destacados</h2>
              <Badge variant="outline" className="w-fit">
                {data.length} clientes
              </Badge>
            </div>
            
            <div className="flex flex-col gap-4">            
              <div className="flex gap-2">
                <Select value={range} onValueChange={handleRangeChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="quarter">Último trimestre</SelectItem>
                    <SelectItem value="year">Último año</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={limit} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Mostrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 filas</SelectItem>
                    <SelectItem value="30">30 filas</SelectItem>
                    <SelectItem value="50">50 filas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-lg">
            <Table>
              <TableHeader className="font-medium">
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Facturas</TableHead>
                  <TableHead className="text-center">Última compra</TableHead>
                  <TableHead className="text-right">Total comprado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((customer, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="max-w-[200px] truncate overflow-hidden whitespace-nowrap">
                        {customer.customer_name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {customer.invoice_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.last_purchase
                          ? format(new Date(customer.last_purchase), "dd MMM yyyy", { locale: es })
                          : "Sin fecha"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        S/. {Number(customer.total_purchased).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <div className="text-muted-foreground hidden text-sm lg:block">
                Mostrando página {page} de {totalPages}
              </div>
              <Pagination className="w-full justify-between lg:w-fit">
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
                    <span className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
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
        </div>
      </Card>
    </div>
  )
}