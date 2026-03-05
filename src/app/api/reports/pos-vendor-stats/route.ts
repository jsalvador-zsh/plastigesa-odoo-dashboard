// app/api/reports/pos-vendor-stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { POSService } from "@/services/posService"
import type { POSTimeRange } from "@/types/pos"
function validateTimeRange(range: string | null): POSTimeRange {
  if (range === "today" || range === "week" || range === "month" || range === "quarter" || range === "year") {
    return range
  }
  return "today"
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = validateTimeRange(searchParams.get("range"))
    const salesperson = searchParams.get("salesperson") || undefined
    const stats = await POSService.getPOSStatsByVendor(range, salesperson)
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error("Error fetching POS vendor stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas del vendedor" },
      { status: 500 }
    )
  }
}
