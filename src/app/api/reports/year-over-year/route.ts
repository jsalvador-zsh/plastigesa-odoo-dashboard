import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface YearOverYear {
  month: number
  month_name: string
  current_year: number
  previous_year: number
  current_year_total: number
  previous_year_total: number
  growth_percentage: number
  growth_absolute: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const currentYear = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const previousYear = currentYear - 1
    
    const result = await db.query(`
      WITH monthly_sales AS (
        SELECT 
          EXTRACT(MONTH FROM invoice_date) AS month,
          EXTRACT(YEAR FROM invoice_date) AS year,
          SUM(
            CASE 
              WHEN type = 'out_invoice' THEN amount_total_signed
              WHEN type = 'out_refund' THEN -ABS(amount_total_signed)
              ELSE 0
            END
          ) AS total
        FROM account_move
        WHERE type IN ('out_invoice', 'out_refund')
          AND state = 'posted'
          AND EXTRACT(YEAR FROM invoice_date) IN ($1, $2)
        GROUP BY month, year
      ),
      comparison_data AS (
        SELECT 
          month,
          CASE month
            WHEN 1 THEN 'Enero'
            WHEN 2 THEN 'Febrero'
            WHEN 3 THEN 'Marzo'
            WHEN 4 THEN 'Abril'
            WHEN 5 THEN 'Mayo'
            WHEN 6 THEN 'Junio'
            WHEN 7 THEN 'Julio'
            WHEN 8 THEN 'Agosto'
            WHEN 9 THEN 'Septiembre'
            WHEN 10 THEN 'Octubre'
            WHEN 11 THEN 'Noviembre'
            WHEN 12 THEN 'Diciembre'
          END AS month_name,
          $1 as current_year,
          $2 as previous_year,
          COALESCE(SUM(CASE WHEN year = $1 THEN total END), 0) AS current_year_total,
          COALESCE(SUM(CASE WHEN year = $2 THEN total END), 0) AS previous_year_total
        FROM monthly_sales
        GROUP BY month, month_name
      )
      SELECT 
        month,
        month_name,
        current_year,
        previous_year,
        current_year_total,
        previous_year_total,
        current_year_total - previous_year_total AS growth_absolute,
        CASE 
          WHEN previous_year_total > 0 THEN 
            ROUND(((current_year_total - previous_year_total) / previous_year_total) * 100, 2)
          WHEN current_year_total > 0 THEN 100
          ELSE 0 
        END AS growth_percentage
      FROM comparison_data
      ORDER BY month ASC;
    `, [currentYear, previousYear])

    const data: YearOverYear[] = result.rows.map(row => ({
      month: parseInt(row.month),
      month_name: row.month_name,
      current_year: parseInt(row.current_year),
      previous_year: parseInt(row.previous_year),
      current_year_total: parseFloat(row.current_year_total) || 0,
      previous_year_total: parseFloat(row.previous_year_total) || 0,
      growth_percentage: parseFloat(row.growth_percentage) || 0,
      growth_absolute: parseFloat(row.growth_absolute) || 0
    }))

    // Debug info
    console.log(`Year over year comparison ${previousYear} vs ${currentYear}:`)
    console.log("Total months:", data.length)
    
    if (data.length > 0) {
      const totalCurrentYear = data.reduce((sum, d) => sum + d.current_year_total, 0)
      const totalPreviousYear = data.reduce((sum, d) => sum + d.previous_year_total, 0)
      const overallGrowth = totalPreviousYear > 0 ? 
        ((totalCurrentYear - totalPreviousYear) / totalPreviousYear) * 100 : 0
      
      console.log(`Total ${currentYear}: ${totalCurrentYear.toFixed(2)}`)
      console.log(`Total ${previousYear}: ${totalPreviousYear.toFixed(2)}`)
      console.log(`Overall growth: ${overallGrowth.toFixed(2)}%`)
    }

    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error("Error fetching year over year data:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener análisis año tras año" },
      { status: 500 }
    )
  }
}