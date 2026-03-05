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
    const journalId = searchParams.get("journal_id") ? parseInt(searchParams.get("journal_id")!, 10) : undefined
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : undefined
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined
    // Obtener condiciones de fecha
    const dateConditions = StatsService.getDateConditions(range, month, year)
    // Obtener todas las estadísticas en paralelo
    const [
      totalCustomers,
      currentPeriodCustomers,
      previousPeriodCustomers,
      topCustomer,
      ticketStats,
      newCustomers
    ] = await Promise.all([
      StatsService.getTotalActiveCustomers(journalId),
      StatsService.getCustomersByPeriod(dateConditions.current, journalId),
      StatsService.getCustomersByPeriod(dateConditions.previous, journalId),
      StatsService.getTopCustomer(dateConditions.current, journalId),
      StatsService.getTicketStats(dateConditions.current, journalId),
      StatsService.getNewCustomers(dateConditions.current, journalId)
    ])
    // Calcular cambio porcentual
    const totalCustomersChange = StatsService.calculatePercentageChange(
      previousPeriodCustomers,
      currentPeriodCustomers
    )
    const periodDescription = StatsService.getPeriodDescription(range, month, year)
    const stats: CustomerStats = {
      totalCustomers,
      totalCustomersChange,
      topCustomer,
      avgTicket: ticketStats.avgTicket,
      newCustomers,
      invoiceCount: ticketStats.invoiceCount,
      period: periodDescription
    }
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