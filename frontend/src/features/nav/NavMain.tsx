"use client";

import { CirclePlusIcon as IconCirclePlusFilled } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType;
  }[];
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Add Holding"
              onClick={() => navigate("/dashboard/holdings/add")}
              className="bg-gradient-to-r from-chart-1/20 to-chart-1/10 text-foreground hover:from-chart-1/30 hover:to-chart-1/20 backdrop-blur-sm border border-chart-1/20 hover:border-chart-1/30 min-w-8 duration-200 ease-linear transition-all"
            >
              <IconCirclePlusFilled className="text-chart-1" />
              <span className="font-medium">Add Holding</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              location.pathname === item.url ||
              (item.url !== "/dashboard" &&
                location.pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => navigate(item.url)}
                  className={`
                    transition-all duration-200 ease-linear group hover:scale-[1.02]
                    ${
                      isActive
                        ? "bg-gradient-to-r from-chart-1/20 to-chart-1/10 text-foreground border border-chart-1/30 backdrop-blur-sm shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/50 border border-transparent"
                    }
                  `}
                >
                  {item.icon && <item.icon />}
                  <span
                    className={`font-medium ${isActive ? "font-semibold" : ""}`}
                  >
                    {item.title}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1 h-1 bg-chart-1 rounded-full animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
