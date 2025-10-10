// src/components/dashboard/overview/CustomersOverview.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, TrendingUp, ShoppingCart, DollarSign } from "lucide-react"
import { useCustomers } from "@/hooks/useCustomers"
import { formatCurrency } from "@/utils/chartUtils"
import Link from "next/link"

export default function CustomersOverview() {
  const { data, loading } = useCustomers({ range: 'month', limit: 5, page: 1 })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcular estadísticas simples
  const totalPurchases = data.reduce((sum, c) => sum + c.purchase_count, 0)
  const totalAmount = data.reduce((sum, c) => sum + c.total_purchased, 0)
  const avgTicket = totalPurchases > 0 ? totalAmount / totalPurchases : 0

  return (
    <Link href="/dashboard/customers/customer-analytics">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          <Users className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Top Clientes</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{data.length}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Monto Total</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalAmount, "S/")}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Compras</span>
              </div>
              <span className="text-sm font-semibold">{totalPurchases}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Ticket Prom</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">{formatCurrency(avgTicket, "S/")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

