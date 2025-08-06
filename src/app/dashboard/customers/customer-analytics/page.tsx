import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"


import { SiteHeader } from "@/components/layout/site-header"
import InactiveCustomersTable from "@/components/dashboard/customers/InactiveCustomersTable"


export default async function DashboardPage() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Análisis" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6">
              <InactiveCustomersTable />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
