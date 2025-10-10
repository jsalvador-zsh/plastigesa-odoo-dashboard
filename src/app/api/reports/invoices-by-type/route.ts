// app/api/reports/invoices-by-type/route.ts
import { NextRequest, NextResponse } from "next/server"
import { InvoiceService } from "@/services/invoiceService"
import type { TimeRange } from "@/types/invoice"

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
    
    console.log("Invoices by type API called:", { range })
    
    const data = await InvoiceService.getInvoicesByType(range)
    
    return NextResponse.json({
      success: true,
      data
    })
    
  } catch (error) {
    console.error("Error fetching invoices by type:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener facturación por tipo" },
      { status: 500 }
    )
  }
}

