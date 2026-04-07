import { NextRequest, NextResponse } from "next/server"
import { POSService } from "@/services/posService"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    
    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const customers = await POSService.searchCustomers(query)
    
    return NextResponse.json({
      success: true,
      data: customers
    })
  } catch (error) {
    console.error("Error searching customers:", error)
    return NextResponse.json(
      { success: false, error: "Error al buscar clientes" },
      { status: 500 }
    )
  }
}
