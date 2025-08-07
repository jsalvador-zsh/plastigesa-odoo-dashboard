// app/api/reports/pos-salespersons/route.ts
import { NextRequest, NextResponse } from "next/server"
import { POSService } from "@/services/posService"

export async function GET(req: NextRequest) {
  try {
    console.log("POS salespersons list API called")
    
    const salespersons = await POSService.getSalespersonList()
    
    return NextResponse.json({
      success: true,
      data: salespersons
    })
    
  } catch (error) {
    console.error("Error fetching POS salespersons:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener lista de vendedores" },
      { status: 500 }
    )
  }
}