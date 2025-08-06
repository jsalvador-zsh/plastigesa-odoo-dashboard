// app/api/reports/inactive-customers/route.ts
import { NextRequest, NextResponse } from "next/server"
import { InactiveCustomersService } from "@/services/inactiveCustomersService"
import type { InactivityPeriod } from "@/types/inactive"

function validatePage(page: string | null): number {
  const parsed = parseInt(page || "1", 10)
  return parsed > 0 ? parsed : 1
}

function validateLimit(limit: string | null): number {
  const parsed = parseInt(limit || "10", 10)
  return [10, 30, 50, 100].includes(parsed) ? parsed : 10
}

function validatePeriod(period: string | null): InactivityPeriod {
  if (period === "3_months" || period === "6_months" || period === "1_year") {
    return period
  }
  return "3_months" // default
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = validatePage(searchParams.get("page"))
    const limit = validateLimit(searchParams.get("limit"))
    const period = validatePeriod(searchParams.get("period"))
    const all = searchParams.get("all") === "true"
    
    console.log("Inactive customers API called:", { page, limit, period, all }) // Debug

    const result = await InactiveCustomersService.getInactiveCustomers(
      period, 
      page, 
      limit, 
      all
    )

    const response = {
      success: true,
      data: result.data,
      meta: result.meta,
      period_info: {
        period,
        description: InactiveCustomersService.getPeriodDescription(period)
      }
    }

    console.log("Inactive customers result:", { count: result.data.length, meta: result.meta }) // Debug

    return NextResponse.json(response)
    
  } catch (error) {
    console.error("Error fetching inactive customers:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener clientes inactivos" },
      { status: 500 }
    )
  }
}