"use client"
import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { RefreshCw, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CHART_COLORS } from "@/utils/chartUtils"
import type { Journal } from "@/types/invoice"
export default function NewCustomersEvolutionChart() {
  const [data, setData] = useState<{ month: string, count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [journalId, setJournalId] = useState<number | undefined>(undefined)
  const [journals, setJournals] = useState<Journal[]>([])
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      let url = `/api/reports/new-customers-evolution`
      if (journalId) url += `?journal_id=${journalId}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        throw new Error(json.error || "Error al cargar datos")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [journalId])
  useEffect(() => {
    fetch('/api/reports/journals')
      .then(res => res.json())
      .then(json => {
        if (json.success) setJournals(json.data)
      })
  }, [])
  if (loading && data.length === 0) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
      </Card>
    )
  }
  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Evolución de Nuevos Clientes
          </CardTitle>
          <CardDescription>
            Nuevos clientes adquiridos por mes (últimos 12 meses)
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={journalId?.toString() || 'all'} onValueChange={(v) => setJournalId(v === 'all' ? undefined : parseInt(v, 10))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Serie/Diario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las series</SelectItem>
              {journals.map((j) => (
                <SelectItem key={j.id} value={j.id.toString()}>{j.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => {
                    const [year, month] = val.split('-')
                    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                    return months[parseInt(month) - 1]
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="count"
                  name="Nuevos Clientes"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === data.length - 1 ? CHART_COLORS.primary : CHART_COLORS.accent}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
