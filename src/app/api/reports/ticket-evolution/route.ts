// src/app/api/reports/ticket-evolution/route.ts
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

    console.log("Ticket evolution API called:", { range })

    const result = await SalesService.getTicketEvolution(range)

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
    console.error("Error fetching ticket evolution:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener evolución de ticket promedio" },
      { status: 500 }
    )
  }
}