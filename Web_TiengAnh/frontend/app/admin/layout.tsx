// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { 
//   LayoutDashboard, 
//   BookOpen, 
//   GamepadIcon,
//   Users 
// } from "lucide-react";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div className="w-64 bg-background border-r">
//         <div className="p-6">
//           <h1 className="text-xl font-bold">Admin Panel</h1>
//         </div>
//         <nav className="space-y-2 p-4">
//           <Button variant="ghost" className="w-full justify-start" asChild>
//             <Link href="/admin">
//               <LayoutDashboard className="w-4 h-4 mr-2" />
//               Dashboard
//             </Link>
//           </Button>
          
//           {/* Game Management */}
//           <div className="pt-4">
//             <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-2">
//               Game Management
//             </h3>
//             <Button variant="ghost" className="w-full justify-start" asChild>
//               <Link href="/admin/game/categories">
//                 <GamepadIcon className="w-4 h-4 mr-2" />
//                 Categories Game
//               </Link>
//             </Button>
//             <Button variant="ghost" className="w-full justify-start" asChild>
//               <Link href="/admin/game/words">
//                 <BookOpen className="w-4 h-4 mr-2" />
//                 Từ vựng Game
//               </Link>
//             </Button>
//           </div>

//           {/* Thêm các navigation khác nếu cần */}
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 overflow-auto">
//         {children}
//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  GamepadIcon,
  Users,
  Settings,
  LogOut
} from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="p-6 border-b">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <GamepadIcon className="w-6 h-6 text-primary" />
              Admin Panel
            </h1>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin")}>
                  <Link href="/admin" className="flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Game Management Group */}
              <div className="px-3 py-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Game Management
                </h3>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/game/categories")}>
                    <Link href="/admin/game/categories" className="flex items-center">
                      <GamepadIcon className="w-4 h-4 mr-2" />
                      Categories Game
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/game/words")}>
                    <Link href="/admin/game/words" className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Từ vựng Game
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/game/matching")}>
                    <Link href="/admin/game/matching" className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Matching Game
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>

              {/* Users & Settings */}
              <div className="px-3 py-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quản lý
                </h3>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                    <Link href="/admin/users" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Người dùng
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                    <Link href="/admin/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Cài đặt
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/logout">
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}