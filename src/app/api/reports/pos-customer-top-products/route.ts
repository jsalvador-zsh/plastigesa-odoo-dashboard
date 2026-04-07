import { NextRequest, NextResponse } from "next/server"
import { POSService } from "@/services/posService"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerIdParam = searchParams.get("customerId")
    
    if (!customerIdParam) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del cliente" },
        { status: 400 }
      )
    }

    const customerId = parseInt(customerIdParam, 10)
    const limit = parseInt(searchParams.get("limit") || "5", 10)

    const topProducts = await POSService.getTopProductsByCustomer(customerId, limit)
    
    return NextResponse.json({
      success: true,
      data: topProducts
    })
  } catch (error) {
    console.error("Error fetching POS customer top products:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener productos del cliente" },
      { status: 500 }
    )
  }
}
