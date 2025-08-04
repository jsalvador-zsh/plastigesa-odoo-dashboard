import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"


import { SiteHeader } from "@/components/layout/site-header"

export default async function DashboardPage() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Dashboard de clientes potenciales" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
