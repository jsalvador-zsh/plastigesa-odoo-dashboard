// src/app/dashboard/sales/pos-vendors/page.tsx
"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import POSVendorStatsCards from "@/components/dashboard/sales/POSVendorStatsCards"
import POSVendorOrdersTable from "@/components/dashboard/sales/POSVendorOrdersTable"
import POSVendorPerformanceChart from "@/components/dashboard/sales/POSVendorPerformanceChart"
import POSVendorRanking from "@/components/dashboard/sales/POSVendorRanking"
import POSSalesByPersonChart from "@/components/dashboard/sales/POSSalesByPersonChart"
import POSHourlySalesChart from "@/components/dashboard/sales/POSHourlySalesChart"

export default function POSVendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<string>("all")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Vendedores POS" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6">
              {/* Estadísticas principales por vendedor */}
              <POSVendorStatsCards 
                selectedVendor={selectedVendor}
                onVendorChange={setSelectedVendor}
              />

              {/* Ranking y gráficos de rendimiento */}
              <div className="grid grid-cols-1 gap-6 @3xl/main:grid-cols-3">
                <POSVendorRanking />
                <div className="@3xl/main:col-span-2">
                  <POSVendorPerformanceChart />
                </div>
              </div>

              {/* Gráfico comparativo de vendedores */}
              <POSSalesByPersonChart />

              {/* Gráfico de ventas por hora */}
              <POSHourlySalesChart />

              {/* Tabla de órdenes por vendedor */}
              <POSVendorOrdersTable 
                selectedVendor={selectedVendor}
                onVendorChange={setSelectedVendor}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

