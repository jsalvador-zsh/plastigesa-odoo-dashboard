// app/api/reports/invoices/route.ts
import { NextRequest, NextResponse } from "next/server"
import { InvoiceService } from "@/services/invoiceService"
import type { TimeRange, InvoiceType, InvoiceState } from "@/types/invoice"
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
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const type = searchParams.get("type") as InvoiceType | undefined
    const state = searchParams.get("state") as InvoiceState | undefined
    const journalId = searchParams.get("journal_id") ? parseInt(searchParams.get("journal_id")!, 10) : undefined
    const result = await InvoiceService.getInvoices(range, page, limit, type, state, journalId)
    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener facturas" },
      { status: 500 }
    )
  }
}
