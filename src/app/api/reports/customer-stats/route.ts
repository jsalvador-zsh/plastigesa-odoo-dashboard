// app/api/reports/customer-stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { StatsService } from "@/services/statsService"
import type { TimeRange } from "@/types/dashboard"
import type { CustomerStats } from "@/types/stats"

function validateTimeRange(range: string | null): TimeRange {
  if (range === "month" || range === "quarter" || range === "year") {
    return range
  }
  return "month" // default
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = validateTimeRange(searchParams.get("range"))
    
    console.log("Stats API called with range:", range) // Debug
    
    // Obtener condiciones de fecha
    const dateConditions = StatsService.getDateConditions(range)
    console.log("Date conditions:", dateConditions) // Debug
    
    // Obtener todas las estadísticas en paralelo
    const [
      totalCustomers,
      currentPeriodCustomers,
      previousPeriodCustomers,
      topCustomer,
      ticketStats,
      newCustomers
    ] = await Promise.all([
      StatsService.getTotalActiveCustomers(),
      StatsService.getCustomersByPeriod(dateConditions.current),
      StatsService.getCustomersByPeriod(dateConditions.previous),
      StatsService.getTopCustomer(dateConditions.current),
      StatsService.getTicketStats(dateConditions.current),
      StatsService.getNewCustomers(dateConditions.current)
    ])
    
    // Calcular cambio porcentual
    const totalCustomersChange = StatsService.calculatePercentageChange(
      previousPeriodCustomers,
      currentPeriodCustomers
    )
    
    const periodDescription = StatsService.getPeriodDescription(range)
    
    const stats: CustomerStats = {
      totalCustomers,
      totalCustomersChange,
      topCustomer,
      avgTicket: ticketStats.avgTicket,
      newCustomers,
      invoiceCount: ticketStats.invoiceCount,
      period: periodDescription
    }
    
    console.log("Final stats:", stats) // Debug
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error("Error fetching customer stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener las estadísticas" },
      { status: 500 }
    )
  }
}