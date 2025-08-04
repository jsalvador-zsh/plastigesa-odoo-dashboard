import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import CustomerStats from "@/components/dashboard/customers/CustomerStats"
import TopCustomersChart from "@/components/dashboard/customers/TopCustomersChart"
import TopCustomersTable from "@/components/dashboard/customers/TopCustomersTable"

import { SiteHeader } from "@/components/layout/site-header"
import LatestPurchasesTable from "@/components/dashboard/customers/LatestPurchasesTable"

export default async function DashboardPage() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Dashboard de clientes" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6">
              <CustomerStats />
              <TopCustomersChart />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TopCustomersTable />
                <LatestPurchasesTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
