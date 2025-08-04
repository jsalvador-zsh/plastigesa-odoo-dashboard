"use client"

import { useQuery } from "@tanstack/react-query"
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export function HourlySalesChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hourly-sales"],
    queryFn: () =>
      fetch("/api/reports/daily-sales").then((res) => res.json()),
  })

  if (error) return <div>Error al cargar datos</div>

  const hourlyData = data?.data?.hourlySales?.map((item: any) => {
    // Ajustar la hora UTC a UTC-5
    const originalHour = parseInt(item.hour, 10)
    const adjustedHour = (originalHour - 5 + 24) % 24 // Restar 5 horas y manejar valores negativos

    return {
      ...item,
      total_amount: Number(item.total_amount),
      hourLabel: `${adjustedHour}:00`, // Mostrar hora ajustada
      originalHour: originalHour, // Mantener la hora original para referencia
    }
  }) ?? []

  // Ordenar los datos por hora ajustada
  hourlyData.sort((a: any, b: any) => a.originalHour - b.originalHour)

  const chartConfig = {
    total_amount: {
      label: "Ventas",
      color: "var(--primary)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por hora</CardTitle>
        <CardDescription>
          Cantidad facturada por hora desde las 8:00am hasta las 5:00pm
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <ChartContainer config={chartConfig} className="w-full">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hourLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => {
                          const num = typeof value === "number" ? value : Number(value)
                          return [`S/ ${num.toFixed(2)}`, "Ventas"]
                        }}
                        labelFormatter={(label) => `Hora: ${label}`}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="total_amount"
                    stroke="var(--primary)"
                    fill="url(#fillVentas)"
                    name="Ventas"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}