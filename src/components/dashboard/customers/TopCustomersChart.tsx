"use client"

import { useEffect, useState } from "react"
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
    YAxis,
    Tooltip,
    CartesianGrid,
    LabelList,
} from "recharts"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import { ChevronLeftIcon, ChevronRightIcon, Divide } from "lucide-react"
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

interface Customer {
    customer_name: string
    total_purchased: number
}

export default function TopCustomersChart() {
    const [data, setData] = useState<Customer[]>([])
    const [range, setRange] = useState("month")
    const [limit, setLimit] = useState("10")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
                `/api/reports/top-customers?range=${range}&limit=${limit}&page=${page}`
            )
            const json = await res.json()
            if (json.success) {
                setData(json.data)
                setTotalPages(json.meta.totalPages)
            }
        }

        fetchData()
    }, [range, limit, page])

    const handleLimitChange = (value: string) => {
        setLimit(value)
        setPage(1)
    }

    const handleRangeChange = (value: string) => {
        setRange(value)
        setPage(1)
    }

    const chartConfig = {
        total_purchased: {
            color: "var(--chart-3)",
            label: "Total comprado por cliente",
        },
    } satisfies ChartConfig

    const rangeOptions = [
        { value: "month", label: "Mes" },
        { value: "quarter", label: "Trim." },
        { value: "year", label: "Año" },
    ]

    const limitOptions = [
        { value: "10", label: "Top 10" },
        { value: "30", label: "Top 30" },
        { value: "50", label: "Top 50" },
    ]

    return (
        <div className="space-y-4">
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Clientes Destacados</CardTitle>
                    <CardDescription>
                        <span className="hidden @[540px]/card:block">
                            Los clientes con mayores compras en el período seleccionado
                        </span>
                        <span className="@[540px]/card:hidden">
                            Mayores compras por cliente
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
                                {rangeOptions.map((option) => (
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
                                    {rangeOptions.map((option) => (
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
                                    {limitOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardAction>
                </CardHeader>

                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <BarChart
                            data={data}
                            width={800}
                            height={400}
                            margin={{
                                top: 170,
                            }}
                        >
                            <XAxis
                                dataKey="customer_name"
                                tickMargin={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <Tooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => {
                                            let num: number
                                            if (typeof value === "number") {
                                                num = value
                                            } else if (Array.isArray(value)) {
                                                num = parseFloat(value.join(""))
                                            } else {
                                                num = parseFloat(value)
                                            }
                                            return isNaN(num) ? "S/ 0.00" : `S/ ${num.toFixed(2)}`
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
                                    formatter={(value: any) => {
                                        let num: number
                                        if (typeof value === "number") {
                                            num = value
                                        } else if (Array.isArray(value)) {
                                            num = parseFloat(value.join(""))
                                        } else {
                                            num = parseFloat(value)
                                        }
                                        return isNaN(num) ? "PEN 0.00" : `PEN ${num.toFixed(2)}`
                                    }}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>

                    {totalPages > 1 && (
                        <Pagination className="mt-4 justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => page > 1 && setPage(page - 1)}
                                        aria-disabled={page === 1}
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
                                        aria-disabled={page === totalPages}>
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