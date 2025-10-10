// src/app/dashboard/invoicing/page.tsx
"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import InvoiceStatsCards from "@/components/dashboard/invoicing/InvoiceStatsCards"
import InvoicesTable from "@/components/dashboard/invoicing/InvoicesTable"
import InvoiceCharts from "@/components/dashboard/invoicing/InvoiceCharts"

export default function InvoicingPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Facturación" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6">
              {/* Estadísticas generales */}
              <InvoiceStatsCards />

              {/* Gráficos de análisis */}
              <InvoiceCharts />

              {/* Tabla de facturas y documentos */}
              <InvoicesTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

