"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface QuickAccessItem {
  name: string
  url: string
  icon: LucideIcon
}

export function NavQuickAccess({ items }: { items: QuickAccessItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                className={cn(isActive && "bg-accent")}
              >
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}