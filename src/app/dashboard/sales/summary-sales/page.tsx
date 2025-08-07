"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import ConversionRateTable from "@/components/dashboard/sales/ConversionRateTable"
import SalesStatsCards from "@/components/dashboard/sales/SalesStatsCards"
import SalesOrdersTable from "@/components/dashboard/sales/SalesOrdersTable"
import SalesEvolutionChart from "@/components/dashboard/sales/SalesEvolutionChart"
import TicketEvolutionChart from "@/components/dashboard/sales/TicketEvolutionChart"
import ConversionFunnelChart from "@/components/dashboard/sales/ConversionFunnelChart"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Ventas totales"/>
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="grid gap-4 py-4">
            <SalesStatsCards />
            <div className="grid gap-4 md:grid-cols-2">
              <SalesEvolutionChart />
              <TicketEvolutionChart />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SalesOrdersTable />
              <ConversionFunnelChart />
            </div>
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}