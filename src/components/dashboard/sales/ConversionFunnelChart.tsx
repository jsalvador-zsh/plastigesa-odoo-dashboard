// src/components/sales/ConversionFunnelChart.tsx
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Filter,
  Flag
} from "lucide-react"

import type { TimeRange } from "@/types/sales"
import { useSalesSummary } from "@/hooks/useSales"
import { formatCurrency, RANGE_OPTIONS, getCurrentPeriodDescription } from "@/utils/chartUtils"

export default function ConversionFunnelChart() {
  const [range, setRange] = useState<TimeRange>("month")
  const { summary, loading, error, refetch } = useSalesSummary({ range })

  if (loading || !summary) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Embudo de Conversión
          </CardTitle>
          <CardDescription>Cargando datos del embudo...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Embudo de Conversión
          </CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalOpportunities = summary.quotations.count + summary.sales.count + summary.conversion.lost
  const stages = [
    {
      name: "Cotizaciones",
      count: summary.quotations.states.draft,
      amount: summary.quotations.amount * (summary.quotations.states.draft / (summary.quotations.count || 1)),
      icon: FileText,
      color: "bg-chart-5",
      percentage: totalOpportunities > 0 ? (summary.quotations.states.draft / totalOpportunities) * 100 : 0
    },
    {
      name: "Cotizaciones Enviadas", 
      count: summary.quotations.states.sent,
      amount: summary.quotations.amount * (summary.quotations.states.sent / (summary.quotations.count || 1)),
      icon: Send,
      color: "bg-chart-3",
      percentage: totalOpportunities > 0 ? (summary.quotations.states.sent / totalOpportunities) * 100 : 0
    },
    {
      name: "Órdenes Confirmadas",
      count: summary.sales.states.sale,
      amount: summary.sales.amount * (summary.sales.states.sale / (summary.sales.count || 1)),
      icon: CheckCircle,
      color: "bg-chart-2",
      percentage: totalOpportunities > 0 ? (summary.sales.states.sale / totalOpportunities) * 100 : 0
    },
    {
      name: "Finalizadas",
      count: summary.sales.states.done,
      amount: summary.sales.amount * (summary.sales.states.done / (summary.sales.count || 1)),
      icon: Flag,
      color: "bg-chart-4",
      percentage: totalOpportunities > 0 ? (summary.sales.states.done / totalOpportunities) * 100 : 0
    }
  ]

  const maxCount = Math.max(...stages.map(s => s.count))

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-4 @md/card:flex-row @md/card:items-center @md/card:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Embudo de Conversión
            </CardTitle>
            <CardDescription>
              Pipeline de ventas para {getCurrentPeriodDescription(range).toLowerCase()}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={range} onValueChange={(value) => setRange(value as TimeRange)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={refetch} variant="outline" size="default" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métricas generales */}
        <div className="grid grid-cols-2 @md/card:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalOpportunities}</div>
            <div className="text-xs text-muted-foreground">Total Oportunidades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.conversion.rate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Tasa Conversión</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.sales.count}</div>
            <div className="text-xs text-muted-foreground">Ventas Cerradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.conversion.lost}</div>
            <div className="text-xs text-muted-foreground">Perdidas</div>
          </div>
        </div>

        {/* Embudo visual */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const widthPercentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
            
            return (
              <div key={stage.name} className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-10 h-10 rounded-full ${stage.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{stage.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{stage.count} órdenes</Badge>
                        <Badge variant="secondary">{stage.percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(stage.amount, "S/")}</span>
                      {index > 0 && (
                        <span>
                          Conversión: {stages[index-1].count > 0 
                            ? ((stage.count / stages[index-1].count) * 100).toFixed(1) 
                            : 0}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Barra visual del embudo */}
                <div className="ml-14">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Línea conectora entre etapas */}
                {index < stages.length - 1 && (
                  <div className="ml-14 mt-2 mb-2">
                    <div className="w-px h-4 bg-border ml-6" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Estadísticas adicionales */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 @md/card:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Promedio por venta:</span>
              <span className="font-medium">
                {formatCurrency(summary.sales.count > 0 ? summary.sales.amount / summary.sales.count : 0, "S/")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiempo promedio:</span>
              <span className="font-medium">~15 días</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mejor etapa:</span>
              <span className="font-medium">
                {stages.reduce((best, current) => 
                  current.percentage > best.percentage ? current : best
                ).name}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}