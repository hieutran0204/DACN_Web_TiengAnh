"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Newspaper,
  Gamepad2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/theme-toggle"; // Assuming this exists or similar

// Sidebar items config
const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Knowledge Base", href: "/admin/knowledge", icon: Book },
  { title: "Vocabulary", href: "/admin/vocabulary", icon: BookOpen },
  { title: "Exams", href: "/admin/exams", icon: FileText },
  { title: "Questions", href: "/admin/questions", icon: BookOpen },
  { title: "News", href: "/admin/news", icon: Newspaper },
  { title: "Games", href: "/admin/games", icon: Gamepad2 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:relative lg:shadow-none flex flex-col transition-all duration-300 ${
            isOpen ? "w-72" : "w-20"
        }`}
        animate={{ width: isOpen ? 288 : 80 }}
        initial={false}
        // Mobile override: always slide in full width or hide
        style={{
            transform: isMobileOpen ? 'translateX(0)' : undefined
        }}
      >
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
           {isOpen ? (
             <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg text-white">
                    <ShieldCheck size={20} />
                </div>
                <span>Admin<span className="text-slate-500 font-medium">Panel</span></span>
             </div>
           ) : (
                <div className="w-full flex justify-center">
                    <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg text-white">
                        <ShieldCheck size={24} />
                    </div>
                </div>
           )}
           
           {/* Desktop Toggle */}
           <button 
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
           >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
           </button>

           {/* Mobile Close */}
           <button
                onClick={() => setIsMobileOpen(false)} 
                className="lg:hidden p-2"
           >
                <X size={20} />
           </button>
        </div>

        {/* NAV ITEMS */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
            {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link key={item.href} href={item.href} className="block group">
                         <div className={`
                            relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                            ${isActive 
                                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            }
                         `}>
                              {/* Icon */}
                              <item.icon 
                                className={`shrink-0 transition-colors ${isActive ? "text-purple-600 dark:text-purple-400" : "group-hover:text-purple-500"}`} 
                                size={22} 
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              
                              {/* Label (Hidden if collapsed) */}
                              {isOpen && (
                                  <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="font-medium whitespace-nowrap"
                                  >
                                    {item.title}
                                  </motion.span>
                              )}

                              {/* Active Indicator */}
                              {isActive && (
                                  <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-full my-2"
                                  />
                              )}
                         </div>
                    </Link>
                );
            })}
        </div>

        {/* FOOTER AREA */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             {isOpen ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Administrator</p>
                        <p className="text-xs text-slate-500 truncate">admin@testkiller.com</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                        <LogOut size={18} />
                    </Button>
                </div>
             ) : (
                 <div className="flex justify-center">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                        <LogOut size={20} />
                    </Button>
                 </div>
             )}
        </div>

      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* MOBILE HEADER */}
        <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b bg-white dark:bg-slate-900">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                <Menu />
            </Button>
            <span className="font-bold text-lg">Admin Panel</span>
            <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {/* Background Decor */}
             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-900/10 pointer-events-none -z-10" />
            
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
