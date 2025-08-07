"use client"

import { useState } from "react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
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
    Tooltip,
    LabelList,
} from "recharts"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import { ChevronLeftIcon, ChevronRightIcon, RefreshCw, AlertCircle } from "lucide-react"
import {
    ChartContainer,
    ChartTooltipContent,
    ChartConfig,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Imports de tipos y hooks personalizados
import type { TimeRange, TopLimit } from "@/types/dashboard"
import { useCustomers } from "@/hooks/useCustomers"
import { 
    formatCurrency, 
    formatCustomerName, 
    RANGE_OPTIONS, 
    LIMIT_OPTIONS,
    CHART_COLORS,
    validateChartData,
    getCurrentPeriodDescription 
} from "@/utils/chartUtils"

export default function TopCustomersChart() {
    const [range, setRange] = useState<TimeRange>("month")
    const [limit, setLimit] = useState<TopLimit>("10")
    const [page, setPage] = useState(1)

    const { data, loading, error, totalPages, refetch } = useCustomers({
        range,
        limit,
        page
    })

    const handleLimitChange = (value: string) => {
        setLimit(value as TopLimit)
        setPage(1)
    }

    const handleRangeChange = (value: string | TimeRange) => {
        setRange(value as TimeRange)
        setPage(1)
    }

    const chartConfig: ChartConfig = {
        total_purchased: {
            color: CHART_COLORS.accent,
            label: "Total comprado por cliente",
        },
    }

    // Loading state
    if (loading) {
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Clientes Destacados</CardTitle>
                    <CardDescription>Cargando datos...</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[250px]">
                    <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    // Error state
    if (error) {
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Clientes Destacados</CardTitle>
                    <CardDescription>Error al cargar los datos</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                    <Button 
                        onClick={refetch} 
                        variant="outline" 
                        className="mt-4"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reintentar
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Validar datos del gráfico
    const isValidData = validateChartData(data)

    return (
        <div className="space-y-4">
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Clientes Destacados</CardTitle>
                    <CardDescription>
                        <span className="hidden @[540px]/card:block">
                            Los clientes con mayores compras en {getCurrentPeriodDescription(range).toLowerCase()}
                        </span>
                        <span className="@[540px]/card:hidden">
                            Período: {getCurrentPeriodDescription(range)}
                        </span>
                    </CardDescription>
                    <CardAction>
                        <div className="flex flex-col items-center md:flex-row gap-4">
                            <ToggleGroup
                                type="single"
                                value={range}
                                onValueChange={handleRangeChange}
                                variant="outline"
                                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                            >
                                {RANGE_OPTIONS.map((option) => (
                                    <ToggleGroupItem key={option.value} value={option.value}>
                                        {option.label}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>

                            <Select value={range} onValueChange={handleRangeChange}>
                                <SelectTrigger
                                    className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                                    size="sm"
                                    aria-label="Seleccionar rango"
                                >
                                    <SelectValue placeholder="Seleccionar rango" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {RANGE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={limit} onValueChange={handleLimitChange}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Top" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LIMIT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={refetch}
                                variant="outline"
                                size="sm"
                                disabled={loading}
                                className="ml-auto"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardAction>
                </CardHeader>

                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    {isValidData ? (
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <BarChart
                                data={data}
                                width={800}
                                height={400}
                                margin={{
                                    top: 20,
                                }}
                            >
                                <XAxis
                                    dataKey="customer_name"
                                    tickMargin={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatCustomerName(value)}
                                />
                                <Tooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name, props) => {
                                                const customer = props.payload
                                                const formattedValue = formatCurrency(value, "S/")
                                                const invoiceCount = customer?.invoice_count || 0
                                                const refundCount = customer?.refund_count || 0
                                                
                                                return [
                                                    formattedValue,
                                                    <div key="details" className="text-xs text-muted-foreground mt-1">
                                                        Facturas: {invoiceCount}
                                                        {refundCount > 0 && ` | Notas crédito: ${refundCount}`}
                                                    </div>
                                                ]
                                            }}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="total_purchased"
                                    fill={chartConfig.total_purchased.color}
                                    radius={8}
                                >
                                    <LabelList
                                        dataKey="total_purchased"
                                        position="top"
                                        className="fill-foreground"
                                        fontSize={12}
                                        formatter={(value: any) => formatCurrency(value)}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                            <div className="text-center">
                                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                                <p>No hay datos disponibles para mostrar</p>
                                <p className="text-sm">Intenta cambiar los filtros o el rango de tiempo</p>
                            </div>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <Pagination className="mt-4 justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => page > 1 && setPage(page - 1)}
                                        aria-disabled={page === 1}
                                        className="cursor-pointer"
                                    >
                                        <ChevronLeftIcon />
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <span className="text-sm text-muted-foreground">
                                        Página {page} de {totalPages}
                                    </span>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => page < totalPages && setPage(page + 1)}
                                        aria-disabled={page === totalPages}
                                        className="cursor-pointer"
                                    >
                                        <ChevronRightIcon />
                                    </PaginationLink>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}