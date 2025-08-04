"use client"

import {
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import Link from "next/link"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  // Si no hay usuario, no renderizar nada
  if (!user) return null

  const handleSignOut = () => {
    signOut()
  }

  const handleOpenProfile = () => {
    openUserProfile()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.imageUrl} alt={user.fullName || "Usuario"} />
                <AvatarFallback className="rounded-lg">
                  {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.fullName || user.firstName || "Usuario"}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <ChevronDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || "Usuario"} />
                  <AvatarFallback className="rounded-lg">
                    {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.fullName || user.firstName || "Usuario"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleOpenProfile}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/facturacion" className="w-full flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Facturación
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// Versión recomendada usando UserButton nativo con menú personalizado
export function NavUserWithClerkButton() {
  const { isMobile } = useSidebar()
  const { user } = useUser()
  
  if (!user) return null
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="p-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg",
                userButtonPopoverCard: "rounded-lg shadow-lg min-w-56",
                userButtonPopoverActionButton: "text-sm hover:bg-sidebar-accent",
                userButtonPopoverActionButtonText: "text-sm",
                userButtonPopoverActionButtonIcon: "h-4 w-4 mr-2",
                userButtonPopoverFooter: "hidden", // Oculta el footer de Clerk
              },
              variables: {
                borderRadius: "0.5rem",
              }
            }}
            showName={true}
            userProfileMode="modal"
          >
            <UserButton.MenuItems>
              {/* Perfil y configuración ahora usan las páginas nativas de Clerk */}
              <UserButton.Action label="manageAccount" />
              <UserButton.Link
                label="Facturación"
                labelIcon={<CreditCard className="h-4 w-4" />}
                href="/facturacion"
              />
              {/* Cerrar sesión ya está incluido por defecto */}
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}