// app/api/reports/journals/route.ts
import { NextRequest, NextResponse } from "next/server"
import { InvoiceService } from "@/services/invoiceService"

export async function GET(req: NextRequest) {
  try {
    console.log("Journals API called")
    
    const data = await InvoiceService.getJournals()
    
    return NextResponse.json({
      success: true,
      data
    })
    
  } catch (error) {
    console.error("Error fetching journals:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener diarios" },
      { status: 500 }
    )
  }
}

