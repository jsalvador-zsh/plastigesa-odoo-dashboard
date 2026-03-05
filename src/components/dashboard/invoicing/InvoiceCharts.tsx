// src/components/dashboard/invoicing/InvoiceCharts.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle, BarChart3, PieChart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend
} from "recharts"
import type { TimeRange } from "@/types/invoice"
import { useInvoicesByType, useInvoicesByJournal } from "@/hooks/useInvoices"
import { formatCurrency } from "@/utils/chartUtils"
const TIME_RANGE_OPTIONS = [
  { value: "week", label: "Última semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" }
]
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
export default function InvoiceCharts() {
  const [range, setRange] = useState<TimeRange>("month")
  const { data: byType, loading: loadingType, error: errorType, refetch: refetchType } = useInvoicesByType(range)
  const { data: byJournal, loading: loadingJournal, error: errorJournal, refetch: refetchJournal } = useInvoicesByJournal(range)
  const loading = loadingType || loadingJournal
  const error = errorType || errorJournal
  if (loading) {
    return (
      <div className="grid grid-cols-1 @5xl/main:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => { refetchType(); refetchJournal(); }} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 @5xl/main:grid-cols-2 gap-6">
      {/* Facturación por Tipo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Facturación por Tipo
              </CardTitle>
              <CardDescription>Distribución de documentos</CardDescription>
            </div>
            <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {byType.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={byType}
                    dataKey="total_amount"
                    nameKey="type_label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  >
                    {byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-4">
                          <p className="font-semibold mb-2">{data.type_label}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Documentos:</span>
                              <span className="font-medium">{data.count}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Monto:</span>
                              <span className="font-medium text-green-600">{formatCurrency(data.total_amount, "S/")}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Participación:</span>
                              <span className="font-medium text-purple-600">{data.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Facturación por Diario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Facturación por Diario
          </CardTitle>
          <CardDescription>Montos por diario contable</CardDescription>
        </CardHeader>
        <CardContent>
          {byJournal.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byJournal} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="journal_code"
                    stroke="#64748b"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-4">
                          <p className="font-semibold mb-2">{data.journal_name}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Documentos:</span>
                              <span className="font-medium">{data.count}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Monto:</span>
                              <span className="font-medium text-green-600">{formatCurrency(data.total_amount, "S/")}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }} />
                  <Bar dataKey="total_amount" radius={[8, 8, 0, 0]}>
                    {byJournal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
