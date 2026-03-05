// src/components/dashboard/overview/ProductsOverview.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, TrendingUp, Hash } from "lucide-react"
import { usePOSTopProducts } from "@/hooks/usePOS"
import { formatCurrency } from "@/utils/chartUtils"
import Link from "next/link"
export default function ProductsOverview() {
  const { data, loading } = usePOSTopProducts('today', 5)
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }
  const totalQty = data.reduce((sum, p) => sum + p.quantity_sold, 0)
  const totalAmount = data.reduce((sum, p) => sum + p.total_amount, 0)
  return (
    <Link href="/dashboard/products">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Productos Hoy</CardTitle>
          <Package className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Unidades</p>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{Math.round(totalQty)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Ventas</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalAmount, "S/")}</p>
            </div>
          </div>
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Más vendidos:</p>
            {data.slice(0, 3).map((product, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1 pr-2" title={product.product_name}>
                  {index + 1}. {product.product_name.length > 25 ? product.product_name.substring(0, 25) + '...' : product.product_name}
                </span>
                <span className="font-semibold text-green-600">{Math.round(product.quantity_sold)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
