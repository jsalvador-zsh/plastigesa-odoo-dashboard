"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, CircleDollarSign, Users, Receipt } from "lucide-react"

export function DailySalesSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-sales-summary'],
    queryFn: () => fetch('/api/reports/daily-sales').then(res => res.json())
  })

  if (error) return <div>Error al cargar datos</div>

  const summary = data?.data?.summary

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Ventas Totales</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl font-semibold tabular-nums">
              {formatCurrency(summary?.total_sales || 0)}
              <CircleDollarSign className="size-6 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <CardFooter className="px-0 flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  Hoy
                </div>
              </CardFooter>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Facturas</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl font-semibold tabular-nums">
              {summary?.total_invoices || 0}
              <Receipt className="size-6 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <CardFooter className="px-0 flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  Transacciones realizadas
                </div>
              </CardFooter>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Clientes</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl font-semibold tabular-nums">

              {summary?.total_customers || 0}
              <Users className="size-6 text-muted-foreground" />

            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <CardFooter className="px-0 flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  Clientes atendidos
                </div>
              </CardFooter>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Ticket Promedio</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl font-semibold tabular-nums">
                  {formatCurrency(summary?.average_ticket || 0)}
            <TrendingUp className="size-6 text-muted-foreground" />

            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <CardFooter className="px-0 flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  Por factura
                </div>
              </CardFooter>
            )}
          </CardFooter>
        </Card>
      </div>

    </div>
  )
}