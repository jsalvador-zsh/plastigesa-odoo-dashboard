// src/components/dashboard/overview/SalesOverview.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, TrendingUp, FileText, DollarSign } from "lucide-react"
import { useSalesStats } from "@/hooks/useSales"
import { formatCurrency } from "@/utils/chartUtils"
import Link from "next/link"
export default function SalesOverview() {
  const { stats, loading } = useSalesStats({ range: 'month' })
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
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
    <Link href="/dashboard/sales/summary-sales">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Cotizaciones</p>
              </div>
              <p className="text-xl font-bold">{stats?.totalQuotations || 0}</p>
              <p className="text-xs text-green-600">{formatCurrency(stats?.totalQuotationAmount || 0, "S/")}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Confirmadas</p>
              </div>
              <p className="text-xl font-bold">{stats?.confirmedSales || 0}</p>
              <p className="text-xs text-green-600">{formatCurrency(stats?.totalSalesAmount || 0, "S/")}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tasa Conversión</span>
              <span className="text-sm font-semibold text-blue-600">{stats?.conversionRate.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Ticket Promedio</span>
              <span className="text-sm font-semibold">{formatCurrency(stats?.avgSaleAmount || 0, "S/")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
