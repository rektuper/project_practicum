"use client"

import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { useSidebar } from "./sidebar-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Bot,
  Users,
  Activity,
  CalendarDays,
  CheckSquare,
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSidebarOpen } = useSidebar()
  const [activeRoute, setActiveRoute] = useState<string | null>(null)

  const routes = [
    { href: "/chatbot", label: "Чат-бот", icon: Bot },
    { href: "/employees", label: "Сотрудники", icon: Users },
    { href: "/engagement", label: "Активность", icon: Activity },
    { href: "/events", label: "Календарь", icon: CalendarDays },
    { href: "/tasks", label: "Задачи", icon: CheckSquare },
  ]

  const handleNavigation = (href: string) => {
    if (pathname === href) return
    setActiveRoute(href)
    router.push(href)
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col transition-all duration-200 ease-in-out border-r relative",
        isSidebarOpen ? "w-[240px]" : "w-[72px]"
      )}
    >
      <div className="flex flex-col gap-2 p-3">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href || activeRoute === route.href

          return (
            <Button
              key={route.href}
              variant={isActive ? "active" : "ghost"}
              className={cn(
                "h-10",
                isSidebarOpen
                  ? "w-full justify-start gap-2 px-3"
                  : "w-10 justify-center px-0 mx-auto"
              )}
              onClick={() => handleNavigation(route.href)}
              title={!isSidebarOpen ? route.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isSidebarOpen && <span>{route.label}</span>}
            </Button>
          )
        })}

        <div
          className={cn(
            "mt-auto pt-4 border-t mt-4",
            isSidebarOpen ? "block" : "flex justify-center"
          )}
        >
          {isSidebarOpen ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Тема</span>
              <ModeToggle />
            </div>
          ) : (
            <ModeToggle />
          )}
        </div>
      </div>
    </aside>
  )
}