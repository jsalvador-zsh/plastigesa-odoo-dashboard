"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, HelpCircle, Search } from "lucide-react"

interface SiteHeaderProps {
  title?: string
}

export function SiteHeader({ title = "Dashboard" }: SiteHeaderProps) {
  return (
    <header className="flex h-12 top-0 sticky bg-background z-50 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Botón para colapsar/expandir el sidebar */}
        <SidebarTrigger className="-ml-1" />
        
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {/* Título de la página actual - ahora dinámico */}
        <h1 className="text-base font-medium">{title}</h1>
        
        {/* Controles del header */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Ayuda</span>
          </Button>
          
          <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-4"
          />
          
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/tu-usuario/tu-repositorio"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}