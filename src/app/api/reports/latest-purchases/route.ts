// app/api/reports/latest-purchases/route.ts
import { NextRequest, NextResponse } from "next/server"
import { PurchasesService } from "@/services/purchasesService"
import type { TimeRange, LatestPurchase } from "@/types/purchases"

function validateTimeRange(range: string | null): TimeRange {
  if (range === "month" || range === "quarter" || range === "year") {
    return range
  }
  return "month" // default
}

function validateLimit(limit: string | null): number {
  const parsed = parseInt(limit || "10", 10)
  return parsed > 0 && parsed <= 100 ? parsed : 10
}

function validateMode(mode: string | null): 'period' | 'recent' {
  if (mode === "period" || mode === "recent") {
    return mode
  }
  return "recent" // default
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const limit = validateLimit(searchParams.get("limit"))
    const mode = validateMode(searchParams.get("mode"))
    const range = validateTimeRange(searchParams.get("range"))
    
    console.log("Latest purchases API called:", { limit, mode, range }) // Debug
    
    let purchases: LatestPurchase[]
    
    if (mode === 'period') {
      purchases = await PurchasesService.getLatestPurchases(range, limit)
    } else {
      purchases = await PurchasesService.getRecentPurchases(limit)
    }
    
    // Procesar datos para convertir strings a números
    const processedPurchases = purchases.map(purchase => ({
      customer_name: String(purchase.customer_name || ''),
      invoice_number: String(purchase.invoice_number || ''),
      invoice_date: String(purchase.invoice_date || ''),
      amount_total_signed: parseFloat(String(purchase.amount_total_signed) || '0'),
      invoice_type: purchase.invoice_type || 'out_invoice',
      state: purchase.state || ''
    }))
    
    console.log("Processed purchases:", processedPurchases.length) // Debug
    
    return NextResponse.json({
      success: true,
      data: processedPurchases,
      meta: {
        count: processedPurchases.length,
        mode,
        range: mode === 'period' ? range : undefined
      }
    })
    
  } catch (error) {
    console.error("Error fetching latest purchases:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener las últimas compras" 
      },
      { status: 500 }
    )
  }
}