"use client"

import * as React from "react"
import {
  Package,
  ShoppingCart,
  Users,
  FileText,
  Calendar,
  HelpCircle,
  Bell,
  LayoutDashboard,
  BarChart2
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavQuickAccess } from "@/components/layout/nav-quick-access"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const salesData = {
  user: {
    name: "admin_ventas",
    email: "ventas@empresa.com",
    avatar: "/avatars/admin-ventas.jpg",
  },
  navMain: [
    {
      title: "Dashboard General",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Clientes",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Reporte",
          url: "/dashboard/customers/report-customers",
        },
        {
          title: "Análisis",
          url: "/dashboard/customers/customer-analytics",
        },
        {
          title: "Potenciales",
          url: "/dashboard/customers/potential-customers",
        }
      ],
    },
    {
      title: "Ventas",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Punto de Venta",
          url: "/dashboard/sales/daily-sales",
        },
        {
          title: "Resumen Mensual",
          url: "/dashboard/sales/summary-sales",
        },
        {
          title: "Vendedores",
          url: "/dashboard/sales/vendors",
        },
      ],
    },
    {
      title: "Productos",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Reporte",
          url: "/dashboard/products",
        },
      ],
    },
  ],
  quickAccess: [
    {
      name: "Calendario",
      url: "/calendario",
      icon: Calendar,
    },
    {
      name: "Documentos",
      url: "/documentos",
      icon: FileText,
    },
    {
      name: "Notificaciones",
      url: "/notificaciones",
      icon: Bell,
    },
    {
      name: "Soporte",
      url: "/soporte",
      icon: HelpCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <LayoutDashboard className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-base font-semibold">Plastigesa</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={salesData.navMain} />
        {/* <NavQuickAccess items={salesData.quickAccess} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}