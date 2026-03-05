// src/components/dashboard/overview/InvoicingOverview.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, DollarSign, CheckCircle, Clock } from "lucide-react"
import { useInvoiceStats } from "@/hooks/useInvoices"
import { formatCurrency } from "@/utils/chartUtils"
import Link from "next/link"
export default function InvoicingOverview() {
  const { data: stats, loading } = useInvoiceStats('month')
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }
  const paymentRate = stats && stats.totalAmount > 0 ? (stats.totalPaid / stats.totalAmount) * 100 : 0
  return (
    <Link href="/dashboard/invoicing">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facturación del Mes</CardTitle>
          <FileText className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Documentos</p>
              </div>
              <p className="text-2xl font-bold">{stats?.totalInvoices || 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Monto</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(stats?.totalAmount || 0, "S/")}</p>
            </div>
          </div>
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Cobrado</span>
              </div>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(stats?.totalPaid || 0, "S/")}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-muted-foreground">Pendiente</span>
              </div>
              <span className="text-sm font-semibold text-orange-600">{formatCurrency(stats?.totalPending || 0, "S/")}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all" 
                style={{ width: `${paymentRate}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">{paymentRate.toFixed(1)}% cobrado</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
