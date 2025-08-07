// app/api/reports/quotations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { SalesService } from "@/services/salesService"
import type { TimeRange } from "@/types/dashboard"

function validateTimeRange(range: string | null): TimeRange {
  if (range === "month" || range === "quarter" || range === "year") {
    return range
  }
  return "month"
}

function validateLimit(limit: string | null): number {
  const parsed = parseInt(limit || "10", 10)
  return [10, 30, 50, 100].includes(parsed) ? parsed : 10
}

function validatePage(page: string | null): number {
  const parsed = parseInt(page || "1", 10)
  return parsed > 0 ? parsed : 1
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const range = validateTimeRange(searchParams.get("range"))
    const limit = validateLimit(searchParams.get("limit"))
    const page = validatePage(searchParams.get("page"))
    
    console.log("Quotations API called:", { range, limit, page })

    const result = await SalesService.getQuotations(range, limit, page)

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
    
  } catch (error) {
    console.error("Error fetching quotations:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener las cotizaciones" },
      { status: 500 }
    )
  }
}