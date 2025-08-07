// app/api/reports/pos-hourly-sales/route.ts
import { NextRequest, NextResponse } from "next/server"
import { POSService } from "@/services/posService"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date") || undefined // Formato YYYY-MM-DD
    
    console.log("POS hourly sales API called:", { date })
    
    const hourlySales = await POSService.getHourlySales(date)
    
    return NextResponse.json({
      success: true,
      data: hourlySales
    })
    
  } catch (error) {
    console.error("Error fetching POS hourly sales:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener ventas por hora" },
      { status: 500 }
    )
  }
}