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
              className="bg-primary/20 text-foreground hover:bg-primary/30 backdrop-blur-sm border border-white/10 min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Add Holding</span>
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
                    transition-all duration-200 ease-linear
                    ${
                      isActive
                        ? "bg-primary/20 text-foreground border border-white/20 backdrop-blur-sm"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    }
                  `}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
