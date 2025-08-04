"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart"

interface SalesmanRanking {
  name: string
  sales: number
  invoices: number
  customers: number
  avgTicket: number
}

const chartConfig = {
  vendors: {
    color: "var(--chart-4)",
    label: "Vendedores",
  },
} satisfies ChartConfig

export default function SalesRankingChart() {
  const [data, setData] = useState<SalesmanRanking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/sales-team-stats")
        const json = await res.json()

        if (json.success) {
          setData(json.data.salesmenRanking)
        }
      } catch (error) {
        console.error("Error fetching sales ranking:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Vendedores</CardTitle>
        <CardDescription>Top {data.length} vendedores del mes actual</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tickMargin={10}
                height={100}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Vendedor: ${label}`}
                  />
                }
              />
              <Bar
                dataKey="sales"
                fill={chartConfig.vendors.color}
                radius={8}
              />
              <LabelList
                dataKey="vendors"
                position="top"
                className="fill-foreground"
                fontSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}