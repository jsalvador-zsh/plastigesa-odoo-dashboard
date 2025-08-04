"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LatestPurchase {
  customer_name: string
  invoice_number: string
  invoice_date: string
  amount_total_signed: number
  product_names: string[]
}

export default function LatestPurchasesTable() {
  const [data, setData] = useState<LatestPurchase[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/reports/latest-purchases')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>
            Últimos clientes que compraron
          </CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              {data.length} ventas
            </span>
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 px-6">

          <div className="rounded-lg">
            <Table>
              <TableHeader className="font-medium">
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((purchase, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="max-w-[200px] truncate overflow-hidden whitespace-nowrap">
                        {purchase.customer_name}
                      </TableCell>
                      <TableCell>
                        {purchase.invoice_number}
                      </TableCell>
                      <TableCell className="text-center">
                        {purchase.invoice_date
                          ? format(new Date(purchase.invoice_date), "dd MMM yyyy", { locale: es })
                          : "Sin fecha"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        S/. {Number(purchase.amount_total_signed).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron compras recientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  )
}