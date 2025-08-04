"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const COLORS = ['#4376FF', '#94BFFF', '#2237AD', '#2542DF', '#2E56F7']
const chartConfig = {
  visitors: {
    label: "Productos",
    color: "var(--primary)"
  }
} satisfies ChartConfig
export function TopProductsChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-products'],
    queryFn: () =>
      fetch('/api/reports/daily-sales').then(res => res.json()),
  })

  if (error) return <div>Error al cargar datos</div>

  const topProducts = Array.isArray(data?.data?.topProducts)
    ? data.data.topProducts.map((product: any) => ({
      ...product,
      total_sales: Number(product.total_sales),
    }))
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos más vendidos en el día</CardTitle>
        <CardDescription>Top 5 de productos que más se compraron según facturas emitidas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : topProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay datos para mostrar</p>
        ) : (
          <div>
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={chartConfig} >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={topProducts}
                    stroke="0"
                    dataKey="total_sales"
                    nameKey="product_name"
                  >
                    {topProducts.map((_: { [key: string]: any }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
