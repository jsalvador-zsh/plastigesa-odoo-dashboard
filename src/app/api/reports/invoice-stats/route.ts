// app/api/reports/invoice-stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { InvoiceService } from "@/services/invoiceService"
import type { TimeRange, InvoiceType } from "@/types/invoice"

function validateTimeRange(range: string | null): TimeRange {
  if (range === "week" || range === "month" || range === "quarter" || range === "year" || range === "all") {
    return range
  }
  return "month"
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = validateTimeRange(searchParams.get("range"))
    const type = searchParams.get("type") as InvoiceType | undefined
    
    console.log("Invoice stats API called:", { range, type })
    
    const stats = await InvoiceService.getInvoiceStats(range, type)
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error("Error fetching invoice stats:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas de facturación" },
      { status: 500 }
    )
  }
}

