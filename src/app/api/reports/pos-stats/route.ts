// app/api/reports/pos-stats/route.ts
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
    
    console.log("POS stats API called:", { range })
    
    const stats = await POSService.getPOSStats(range)
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error("Error fetching POS stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas de POS" },
      { status: 500 }
    )
  }
}