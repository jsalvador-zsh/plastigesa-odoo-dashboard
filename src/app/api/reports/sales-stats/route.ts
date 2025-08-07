// app/api/reports/sales-stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { SalesService } from "@/services/salesService"
import type { TimeRange } from "@/types/sales"

function validateTimeRange(range: string | null): TimeRange {
  if (range === "month" || range === "quarter" || range === "year") {
    return range
  }
  return "month"
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = validateTimeRange(searchParams.get("range"))
    
    console.log("Sales stats API called:", { range })

    const stats = await SalesService.getSalesStats(range)

    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error("Error fetching sales stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas de ventas" },
      { status: 500 }
    )
  }
}