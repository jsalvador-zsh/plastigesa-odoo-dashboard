// app/api/reports/pos-orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { POSService } from "@/services/posService"
import type { POSTimeRange } from "@/types/pos"
function validateTimeRange(range: string | null): POSTimeRange {
  if (range === "today" || range === "week" || range === "month" || range === "quarter" || range === "year" || range === "custom") {
    return range
  }
  return "today"
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = validateTimeRange(searchParams.get("range"))
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const salesperson = searchParams.get("salesperson") || undefined
    const startDate = searchParams.get("start_date") || undefined
    const endDate = searchParams.get("end_date") || undefined
    const result = await POSService.getPOSOrders(range, page, limit, salesperson, startDate, endDate)
    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    console.error("Error fetching POS orders:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener órdenes de POS" },
      { status: 500 }
    )
  }
}