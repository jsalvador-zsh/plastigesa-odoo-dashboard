import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import POSTopProductsStats from "@/components/dashboard/products/POSStatsProductsCards"
import POSTopProductsChart from "@/components/dashboard/products/POSTopProductsChart"
import POSRankingDetail from "@/components/dashboard/products/POSRankingDetail"
import POSCustomerTopProducts from "@/components/dashboard/products/POSCustomerTopProducts"
export default async function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col px-4 lg:px-6 mb-8">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="grid gap-4 py-4">
              <POSTopProductsStats />
              <div className="grid gap-4 md:grid-cols-2">
                <POSTopProductsChart />
                <POSRankingDetail />
              </div>            
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-1">
                  <POSCustomerTopProducts />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
