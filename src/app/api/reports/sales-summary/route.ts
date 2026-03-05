// app/api/reports/sales-summary/route.ts
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
    const summary = await SalesService.getSalesSummary(range)
    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error("Error fetching sales summary:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener resumen de ventas" },
      { status: 500 }
    )
  }
}