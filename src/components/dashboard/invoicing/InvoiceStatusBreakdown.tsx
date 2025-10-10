// src/components/dashboard/invoicing/InvoiceStatusBreakdown.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, FileCheck } from "lucide-react"
import type { TimeRange } from "@/types/invoice"
import { useInvoicesByState } from "@/hooks/useInvoices"

const TIME_RANGE_OPTIONS = [
  { value: "week", label: "Última semana" },
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" }
]

export default function InvoiceStatusBreakdown() {
  const [range, setRange] = useState<TimeRange>("month")
  const { data, loading } = useInvoicesByState(range)

  if (loading) {
    return null
  }

  const getIcon = (state: string) => {
    switch (state) {
      case 'posted': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancel': return <XCircle className="h-5 w-5 text-red-600" />
      case 'draft': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default: return <FileCheck className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Estado de Documentos</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
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
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(item.state)}
                <div>
                  <p className="font-medium">{item.state_label}</p>
                  <p className="text-sm text-muted-foreground">{item.count} documentos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">S/ {item.total_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                <Badge variant="outline" className="mt-1">
                  {((item.total_amount / data.reduce((sum, d) => sum + d.total_amount, 0)) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

