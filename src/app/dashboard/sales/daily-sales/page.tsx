"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import POSStatsCards from "@/components/dashboard/sales/POSStatsCards"
import POSOrdersTable from "@/components/dashboard/sales/POSOrdesrsTabel"
import POSHourlySalesChart from "@/components/dashboard/sales/POSHourlySalesChart"
import POSTopProductsChart from "@/components/dashboard/products/POSTopProductsChart"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Ventas (hoy)"/>
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="grid gap-4 py-4">
            <POSStatsCards />
            <div className="grid gap-4 md:grid-cols-2">
            <POSHourlySalesChart />
            <POSTopProductsChart />
            </div>
            <div className="grid gap-4 md:grid-cols-2">


            </div>
            <POSOrdersTable />
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}