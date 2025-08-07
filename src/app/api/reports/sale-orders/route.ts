// app/api/reports/sale-orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { SalesService } from "@/services/salesService"
import type { TimeRange, SaleOrderState } from "@/types/sales"

function validateTimeRange(range: string | null): TimeRange {
  if (range === "month" || range === "quarter" || range === "year") {
    return range
  }
  return "month"
}

function validateState(state: string | null): SaleOrderState | 'all' {
  if (state === "draft" || state === "sent" || state === "sale" || 
      state === "done" || state === "cancel" || state === "all") {
    return state as SaleOrderState | 'all'
  }
  return "all"
}

function validatePage(page: string | null): number {
  const parsed = parseInt(page || "1", 10)
  return parsed > 0 ? parsed : 1
}

function validateLimit(limit: string | null): number {
  const parsed = parseInt(limit || "10", 10)
  return [10, 20, 50, 100].includes(parsed) ? parsed : 10
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const range = validateTimeRange(searchParams.get("range"))
    const state = validateState(searchParams.get("state"))
    const page = validatePage(searchParams.get("page"))
    const limit = validateLimit(searchParams.get("limit"))
    
    console.log("Sale orders API called:", { range, state, page, limit })

    const result = await SalesService.getSaleOrders(range, state, page, limit)

    const response = {
      success: true,
      data: result.data,
      meta: result.meta,
      period_info: {
        period: range,
        description: SalesService.getPeriodDescription(range),
        state_filter: state
      }
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error("Error fetching sale orders:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener órdenes de venta" },
      { status: 500 }
    )
  }
}