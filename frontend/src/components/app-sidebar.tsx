"use client";

import * as React from "react";
import {
  CameraIcon as IconCamera,
  BarChartIcon as IconChartBar,
  TrendingUpIcon as IconTrendingUp,
  LayoutDashboard as IconDashboard,
  DatabaseIcon as IconDatabase,
  FileCodeIcon as IconFileAi,
  FileTextIcon as IconFileDescription,
  FileTextIcon as IconFileWord,
  FolderIcon as IconFolder,
  HelpCircleIcon as IconHelp,
  MoveUpIcon as IconInnerShadowTop,
  ListIcon as IconListDetails,
  AlertCircleIcon as IconReport,
  SearchIcon as IconSearch,
  SettingsIcon as IconSettings,
  UsersIcon as IconUsers,
  NewspaperIcon as IconNewspaper,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "News",
      url: "/dashboard/news",
      icon: IconNewspaper,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Holdings",
      url: "/dashboard/holdings",
      icon: IconListDetails,
    },
    {
      title: "Insights",
      url: "/dashboard/insights",
      icon: IconChartBar,
    },
    {
      title: "Charts",
      url: "/dashboard/charts",
      icon: IconTrendingUp,
    },
    {
      title: "Risk Analysis",
      url: "/dashboard/risk",
      icon: IconFolder,
    },

    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconChartBar className="size-6" />
                <span className="text-base font-semibold">Stockwise</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
