"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { DailySalesTable } from "@/components/dashboard/sales/DailySalesTable"
import SalesVsQuotesChart from "@/components/dashboard/sales/SalesVsQuotesChart"
import SalesSummaryStats from "@/components/dashboard/sales/SalesSummaryStats"
import AverageTicketChart from "@/components/dashboard/sales/TicketEvolutionChart"
import ConversionRateTable from "@/components/dashboard/sales/ConversionRateTable"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Dashboard de ventas totales"/>
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="grid gap-4 py-4">
            <SalesSummaryStats />
            <div className="grid gap-4 md:grid-cols-2">
              <SalesVsQuotesChart />
              <AverageTicketChart />
            </div>
            <ConversionRateTable />
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}