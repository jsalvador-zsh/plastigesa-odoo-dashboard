// app/api/reports/pos-top-products/route.ts
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
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    
    console.log("POS top products API called:", { range, limit })
    
    const topProducts = await POSService.getTopProducts(range, limit)
    
    return NextResponse.json({
      success: true,
      data: topProducts
    })
    
  } catch (error) {
    console.error("Error fetching POS top products:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener productos más vendidos" },
      { status: 500 }
    )
  }
}