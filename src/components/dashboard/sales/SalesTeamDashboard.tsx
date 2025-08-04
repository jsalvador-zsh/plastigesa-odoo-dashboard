import { useEffect, useState } from "react"
import { 
  Card, 
  CardAction, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Target, Trophy, Percent } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface SalesmanRanking {
  name: string
  sales: number
  invoices: number
  customers: number
  avgTicket: number
}

interface TargetResult {
  name: string
  target: number
  achieved: number
  percentage: string
}

interface ConversionRate {
  name: string
  wonLeads: number
  totalLeads: number
  conversionRate: number
}

interface SalesTeamStats {
  totalSalesmen: number
  currentMonthSales: number
  salesChange: number
  currentMonthInvoices: number
  currentMonthCustomers: number
  avgSalesPerSalesman: number
  topSalesman: {
    name: string
    sales: number
    invoices: number
    customers: number
  }
  salesmenRanking: SalesmanRanking[]
  targetsVsResults: TargetResult[]
  conversionRates: ConversionRate[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount)
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export default function SalesTeamDashboard() {
  const [stats, setStats] = useState<SalesTeamStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/sales-team-stats")
        const json = await res.json()
        
        if (json.success) {
          setStats(json.data)
        }
      } catch (error) {
        console.error("Error fetching sales team stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderBadge = (change: number) => {
    const isPositive = change >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    
    return (
      <Badge variant="outline" className={isPositive ? "text-green-600" : "text-red-600"}>
        <Icon className="size-3.5 mr-1" />
        {Math.abs(change).toFixed(1)}%
      </Badge>
    )
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Ventas Totales del Mes */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Trophy className="size-4" />
              Ventas del Mes
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(stats.currentMonthSales)}
            </CardTitle>
            <CardAction>
              {renderBadge(stats.salesChange)}
            </CardAction>
          </CardHeader>
          <CardFooter className="pt-0">
            <div className="text-sm text-muted-foreground">
              {stats.currentMonthInvoices} facturas emitidas
            </div>
          </CardFooter>
        </Card>

        {/* Vendedores Activos */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="size-4" />
              Vendedores Activos
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {stats.totalSalesmen}
            </CardTitle>
          </CardHeader>
          <CardFooter className="pt-0">
            <div className="text-sm text-muted-foreground">
              Equipo de ventas activo
            </div>
          </CardFooter>
        </Card>

        {/* Promedio por Vendedor */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="size-4" />
              Promedio por Vendedor
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(stats.avgSalesPerSalesman)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="pt-0">
            <div className="text-sm text-muted-foreground">
              Ventas promedio este mes
            </div>
          </CardFooter>
        </Card>

        {/* Top Vendedor */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Trophy className="size-4 text-yellow-500" />
              Top Vendedor
            </CardDescription>
            <CardTitle className="text-lg font-bold line-clamp-1">
              {stats.topSalesman.name}
            </CardTitle>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(stats.topSalesman.sales)}
            </div>
          </CardHeader>
          <CardFooter className="pt-0">
            <div className="text-sm text-muted-foreground">
              {stats.topSalesman.invoices} ventas • {stats.topSalesman.customers} clientes
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ranking de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Vendedores</CardTitle>
            <CardDescription>Top 5 vendedores del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.salesmenRanking}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Ventas"]}
                />
                <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Ventas</CardTitle>
            <CardDescription>Participación por vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.salesmenRanking}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="sales"
                  nameKey="name"
                >
                  {stats.salesmenRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Performance Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Detallada</CardTitle>
          <CardDescription>Métricas completas por vendedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Vendedor</th>
                  <th className="text-right p-2 font-medium">Ventas</th>
                  <th className="text-right p-2 font-medium">Facturas</th>
                  <th className="text-right p-2 font-medium">Clientes</th>
                  <th className="text-right p-2 font-medium">Ticket Promedio</th>
                </tr>
              </thead>
              <tbody>
                {stats.salesmenRanking.map((salesman, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{salesman.name}</td>
                    <td className="p-2 text-right font-mono">
                      {formatCurrency(salesman.sales)}
                    </td>
                    <td className="p-2 text-right">{salesman.invoices}</td>
                    <td className="p-2 text-right">{salesman.customers}</td>
                    <td className="p-2 text-right font-mono">
                      {formatCurrency(salesman.avgTicket)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos vs Resultados (si tienes datos) */}
      {stats.targetsVsResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Objetivos vs Resultados</CardTitle>
            <CardDescription>Cumplimiento de metas mensuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.targetsVsResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(result.achieved)} / {formatCurrency(result.target)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={parseFloat(result.percentage) >= 100 ? "default" : "secondary"}>
                      {result.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}