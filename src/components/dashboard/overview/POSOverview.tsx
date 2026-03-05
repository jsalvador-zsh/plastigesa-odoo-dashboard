// src/components/dashboard/overview/POSOverview.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, Receipt, DollarSign, Users } from "lucide-react"
import { usePOSStats } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"
import Link from "next/link"
export default function POSOverview() {
  const { data: stats, loading } = usePOSStats('today')
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Punto de Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Link href="/dashboard/sales/daily-sales">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">POS Hoy</CardTitle>
          <Store className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Ventas</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats?.totalSales || 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Monto</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(stats?.totalAmount || 0, "S/")}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ticket Promedio</span>
              <span className="text-sm font-semibold text-blue-600">{formatCurrency(stats?.avgTicket || 0, "S/")}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Clientes</span>
              </div>
              <span className="text-sm font-semibold">{stats?.totalCustomers || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
