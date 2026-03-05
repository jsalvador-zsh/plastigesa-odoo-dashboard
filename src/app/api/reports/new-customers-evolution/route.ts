// app/api/reports/new-customers-evolution/route.ts
import { NextRequest, NextResponse } from "next/server"
import { StatsService } from "@/services/statsService"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const journalId = searchParams.get("journal_id") ? parseInt(searchParams.get("journal_id")!, 10) : undefined
    const data = await StatsService.getNewCustomersEvolution(journalId)
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error("Error fetching new customers evolution:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener evolución de nuevos clientes" },
      { status: 500 }
    )
  }
}
