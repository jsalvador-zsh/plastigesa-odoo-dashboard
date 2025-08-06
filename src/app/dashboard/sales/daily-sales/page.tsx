"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { DailySalesSummary } from "@/components/dashboard/sales/DailySalesSummary"
import { DailySalesTable } from "@/components/dashboard/sales/DailySalesTable"
import { HourlySalesChart } from "@/components/dashboard/sales/HourlySalesChart"
import { TopProductsChart } from "@/components/dashboard/sales/TopProductsChart"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Ventas (hoy)"/>
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="grid gap-4 py-4">
            <DailySalesSummary />
            <div className="grid gap-4 md:grid-cols-2">
              <HourlySalesChart />
              <TopProductsChart />
            </div>
            <DailySalesTable />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}