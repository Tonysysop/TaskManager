import * as React from "react"
import {
  NotebookPen,
  ClipboardCheck,
  GalleryVerticalEnd,
  TimerReset,
  House,
} from "lucide-react"

import { Skeleton } from "../ui/skeleton"
import { NavMain } from "@/components/Sidebar-component/nav-main"
import { NavUser } from "@/components/Sidebar-component/nav-user"
import { TeamSwitcher } from "@/components/Sidebar-component/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/Context/AuthContext"
import { SidebarTags } from "@/components/Sidebar-component/SidebarTags"



const data = {
  teams: [
    {
      name: "TinuMind",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    }
  ],
  navMain1: [
    {
      title: "Dashboard",
      url: "/tinumind",
      icon: House,
  
    },
    {
      title: "Tasks",
      url: "/tinumind/tasks",
      icon: ClipboardCheck ,
    },
    {
      title: "Notes",
      url: "/tinumind/notes",
      icon: NotebookPen,
    },
  ],
  navMain2: [
    {
      title:"Pomodoro timer",
      url: "/tinumind/pomodoro",
      icon: TimerReset,
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();
  const userDataForNav = {
    name: user?.name || "Loading...", // Handle loading/null state appropriately
    email: user?.email || "",
    avatar: "/avatars/default.jpg", // Use user avatar or a default
  };


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent >
        <NavMain items={data.navMain1} label="Productivity" />
        <NavMain items={data.navMain2} label="Focus" />
        <SidebarTags />
      </SidebarContent>
      <SidebarFooter>
        {loading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <NavUser user={userDataForNav} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
