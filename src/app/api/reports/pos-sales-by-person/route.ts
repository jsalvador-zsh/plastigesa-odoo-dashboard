// app/api/reports/pos-sales-by-person/route.ts
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
    
    console.log("POS sales by person API called:", { range })
    
    const salesData = await POSService.getSalesByPerson(range)
    
    return NextResponse.json({
      success: true,
      data: salesData
    })
    
  } catch (error) {
    console.error("Error fetching POS sales by person:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener ventas por vendedor" },
      { status: 500 }
    )
  }
}