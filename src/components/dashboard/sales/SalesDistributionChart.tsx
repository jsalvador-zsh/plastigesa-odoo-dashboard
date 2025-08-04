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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface SalesmanData {
  name: string
  sales: number
  invoices: number
  customers: number
  avgTicket: number
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export default function SalesDistributionChart() {
  const [data, setData] = useState<SalesmanData[]>([])
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
        console.error("Error fetching sales distribution:", error)
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

  // Calcular el total para porcentajes
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0)
  
  // Preparar datos con porcentajes
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: ((item.sales / totalSales) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            Ventas: {formatCurrency(data.sales)}
          </p>
          <p className="text-muted-foreground">
            {data.percentage}% del total
          </p>
          <p className="text-sm text-muted-foreground">
            {data.invoices} facturas • {data.customers} clientes
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Ventas</CardTitle>
        <CardDescription>Participación porcentual por vendedor</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="sales"
              nameKey="name"
              label={({ percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Resumen numérico */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalSales)}
              </div>
              <div className="text-sm text-muted-foreground">Total Vendido</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {data.length}
              </div>
              <div className="text-sm text-muted-foreground">Vendedores Activos</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}