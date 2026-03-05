"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
// Componentes de resumen
import QuickStats from "@/components/dashboard/overview/QuickStats"
import SalesOverview from "@/components/dashboard/overview/SalesOverview"
import POSOverview from "@/components/dashboard/overview/POSOverview"
import InvoicingOverview from "@/components/dashboard/overview/InvoicingOverview"
import CustomersOverview from "@/components/dashboard/overview/CustomersOverview"
import ProductsOverview from "@/components/dashboard/overview/ProductsOverview"
// Componentes de gráficos (reutilizados)
import POSSalesByPersonChart from "@/components/dashboard/sales/POSSalesByPersonChart"
import InvoiceCharts from "@/components/dashboard/invoicing/InvoiceCharts"
export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Dashboard General" />
        <div className="flex flex-1 flex-col px-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6">
              {/* Estadísticas Rápidas */}
              <div id="tour-quick-stats">
                <QuickStats />
              </div>
              {/* Resúmenes por Área */}
              <div id="tour-area-summaries" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SalesOverview />
                <POSOverview />
                <InvoicingOverview />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CustomersOverview />
                <ProductsOverview />
                {/* Card de acceso rápido */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold mb-2">Bienvenido al Dashboard</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aquí encuentras un resumen ejecutivo de todas tus operaciones.
                    Haz clic en cada tarjeta para ver más detalles.
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>📊 Ventas</span>
                    <span>•</span>
                    <span>🛒 POS</span>
                    <span>•</span>
                    <span>📄 Facturación</span>
                  </div>
                </div>
              </div>
              {/* Gráficos Destacados */}
              <div id="tour-charts" className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <POSSalesByPersonChart />
                <InvoiceCharts />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
