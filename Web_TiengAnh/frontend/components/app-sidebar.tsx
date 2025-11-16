"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  BarChart3,
  Lightbulb,
  FileText,
  Gamepad2,
  Home,
  LogOut,
  Settings,
} from "lucide-react";

export function AppSidebar() {
  const mainItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Mock Tests",
      href: "/tests",
      icon: BarChart3,
    },
    {
      title: "Skill Assessment",
      href: "/skills",
      icon: Lightbulb,
    },
    {
      title: "Vocabulary",
      href: "/vocabulary",
      icon: BookOpen,
    },
    {
      title: "Articles",
      href: "/articles",
      icon: FileText,
    },
    {
      title: "Learning Games",
      href: "/games",
      icon: Gamepad2,
    },
  ];

  const secondaryItems = [
    {
      title: "Settings",
      href: "#",
      icon: Settings,
    },
    {
      title: "Sign Out",
      href: "#",
      icon: LogOut,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">E</span>
          </div>
          <h1 className="text-lg font-bold text-sidebar-foreground">
            TestKiller
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {mainItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {/* {secondaryItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))} */}
          {secondaryItems.map((item, index) => (
            <SidebarMenuItem key={`${item.href}-${index}`}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
