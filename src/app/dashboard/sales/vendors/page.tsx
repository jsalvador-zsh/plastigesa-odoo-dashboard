"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import SalesTeamStats from "@/components/dashboard/sales/SalesTeamStats"
import SalesRankingChart from "@/components/dashboard/sales/SalesRankingChart"
import SalesDistributionChart from "@/components/dashboard/sales/SalesDistributionChart"
import SalesPerformanceTable from "@/components/dashboard/sales/SalesPerformanceTable"
import SalesTargetsTable from "@/components/dashboard/sales/SalesTargetsvsResultsTable"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Dashboard de vendedores" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6">
              <div className="grid gap-4 py-4">
                <SalesTeamStats />
                <SalesPerformanceTable />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <SalesRankingChart />
                  <SalesDistributionChart />
                </div>
                <SalesTargetsTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}