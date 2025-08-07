// src/app/api/reports/sales-evolution/route.ts
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

    console.log("Sales evolution API called:", { range })

    const result = await SalesService.getSalesEvolution(range)

    const response = {
      success: true,
      data: result.data,
      period_info: {
        period: range,
        description: SalesService.getPeriodDescription(range)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching sales evolution:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener evolución de ventas" },
      { status: 500 }
    )
  }
}