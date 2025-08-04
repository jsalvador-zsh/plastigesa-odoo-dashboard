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
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TargetIcon, TrendingUpIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon } from "lucide-react"

interface TargetResult {
  name: string
  target: number
  achieved: number
  percentage: string
}

export default function SalesTargetsTable() {
  const [data, setData] = useState<TargetResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/sales-team-stats")
        const json = await res.json()
        
        if (json.success) {
          setData(json.data.targetsVsResults)
        }
      } catch (error) {
        console.error("Error fetching sales targets:", error)
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
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si no hay objetivos definidos, mostrar mensaje
  if (data.every(item => item.target === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="size-5" />
            Objetivos vs Resultados
          </CardTitle>
          <CardDescription>Configuración de metas mensuales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TargetIcon className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay objetivos configurados</h3>
            <p className="text-muted-foreground mb-4">
              Define objetivos mensuales para cada vendedor para hacer seguimiento al cumplimiento de metas.
            </p>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <AlertCircleIcon className="size-3 mr-1" />
              Próximamente: Configuración de objetivos
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <CheckCircleIcon className="size-4 text-green-500" />
    if (percentage >= 75) return <TrendingUpIcon className="size-4 text-yellow-500" />
    if (percentage >= 50) return <AlertCircleIcon className="size-4 text-orange-500" />
    return <XCircleIcon className="size-4 text-red-500" />
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircleIcon className="size-3 mr-1" />
          Objetivo cumplido
        </Badge>
      )
    }
    if (percentage >= 75) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <TrendingUpIcon className="size-3 mr-1" />
          En progreso
        </Badge>
      )
    }
    if (percentage >= 50) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
          <AlertCircleIcon className="size-3 mr-1" />
          Atención
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        <XCircleIcon className="size-3 mr-1" />
        Bajo objetivo
      </Badge>
    )
  }

  // Calcular estadísticas generales
  const totalTarget = data.reduce((sum, item) => sum + item.target, 0)
  const totalAchieved = data.reduce((sum, item) => sum + item.achieved, 0)
  const overallPercentage = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0
  const vendedoresConObjetivoCumplido = data.filter(item => parseFloat(item.percentage) >= 100).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="size-5" />
          Objetivos vs Resultados
        </CardTitle>
        <CardDescription>Cumplimiento de metas mensuales por vendedor</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Resumen general */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {overallPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cumplimiento General</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {vendedoresConObjetivoCumplido}
              </div>
              <div className="text-sm text-muted-foreground">Objetivos Cumplidos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalTarget)}
              </div>
              <div className="text-sm text-muted-foreground">Meta Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAchieved)}
              </div>
              <div className="text-sm text-muted-foreground">Logrado Total</div>
            </div>
          </div>
        </div>

        {/* Lista de vendedores */}
        <div className="space-y-4">
          {data.map((result, index) => {
            const percentage = parseFloat(result.percentage)
            const remaining = Math.max(0, result.target - result.achieved)
            
            return (
              <div key={index} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(percentage)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(result.achieved)} de {formatCurrency(result.target)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {percentage.toFixed(1)}%
                    </div>
                    {getStatusBadge(percentage)}
                  </div>
                </div>
                
                {/* Barra de progreso visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progreso</span>
                    <span>
                      {remaining > 0 
                        ? `Faltan ${formatCurrency(remaining)}` 
                        : `Superó por ${formatCurrency(Math.abs(remaining))}`
                      }
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage >= 100 ? 'bg-green-500' :
                        percentage >= 75 ? 'bg-yellow-500' :
                        percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mensaje motivacional */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {vendedoresConObjetivoCumplido === data.length 
              ? "¡Excelente! Todo el equipo ha cumplido sus objetivos 🎉"
              : overallPercentage >= 75
              ? "¡Buen trabajo! El equipo está cerca de cumplir las metas 💪"
              : "Hay oportunidades de mejora. ¡A por ello! 🚀"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}