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
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SalesmanRanking {
  name: string
  sales: number
  invoices: number
  customers: number
  avgTicket: number
}

interface SalesTeamData {
  salesmenRanking: SalesmanRanking[]
}

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
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), "Ventas"]}
              labelFormatter={(label) => `Vendedor: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="sales" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}