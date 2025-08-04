import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET() {
  try {
    const result = await db.query(
      `SELECT COUNT(*)::int AS total FROM account_move WHERE type = 'out_invoice';`
    )

    return NextResponse.json({ success: true, totalInvoices: result.rows[0].total })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ success: false, error: "Error al obtener las facturas" }, { status: 500 })
  }
}
