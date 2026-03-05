// src/components/dashboard/overview/QuickStats.tsx
"use client"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, ShoppingCart, Receipt } from "lucide-react"
import { useSalesStats } from "@/hooks/useSales"
import { usePOSStats } from "@/hooks/usePOS"
import { useInvoiceStats } from "@/hooks/useInvoices"
import { formatCurrency } from "@/utils/chartUtils"
export default function QuickStats() {
  const { stats: salesStats } = useSalesStats({ range: 'month' })
  const { data: posStats } = usePOSStats('today')
  const { data: invoiceStats } = useInvoiceStats('month')
  const stats = [
    {
      title: "Ventas del Mes",
      value: formatCurrency(salesStats?.totalSalesAmount || 0, "S/"),
      change: `${salesStats?.confirmedSales || 0} órdenes`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "POS Hoy",
      value: formatCurrency(posStats?.totalAmount || 0, "S/"),
      change: `${posStats?.totalSales || 0} ventas`,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Facturación Mes",
      value: formatCurrency(invoiceStats?.totalAmount || 0, "S/"),
      change: `${invoiceStats?.totalInvoices || 0} documentos`,
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Pendiente Cobro",
      value: formatCurrency(invoiceStats?.totalPending || 0, "S/"),
      change: `Por cobrar`,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
