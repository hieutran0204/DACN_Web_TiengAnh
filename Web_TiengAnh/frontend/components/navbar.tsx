"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, ArrowUp, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeRect, setActiveRect] = useState<{ left: number; width: number; height: number; top: number } | null>(null);
  const navRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  // Scroll & Visibility State
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleDarkMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/tests", label: "Tests" },
    { href: "/skills", label: "Skills" },
    { href: "/vocabulary", label: "Vocabulary" },
    { href: "/articles", label: "Articles" },
    { href: "/games", label: "Games" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Navbar visibility logic
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          setIsVisible(false); // Scrolling down
        } else {
          setIsVisible(true); // Scrolling up
        }
      } else {
        setIsVisible(true); // Always show at top
      }

      // Scroll to top button visibility
      if (currentScrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Find active link based on pathname
    const activeLink = links.find(link =>
      link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
    );

    if (activeLink && navRefs.current[activeLink.href]) {
      const el = navRefs.current[activeLink.href];
      if (el) {
        setActiveRect({
          left: el.offsetLeft,
          width: el.offsetWidth,
          height: el.offsetHeight,
          top: el.offsetTop,
        });
      }
    } else {
      setActiveRect(null);
    }
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch full user profile to get correct name/avatar
      apiFetch("/user/me")
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          console.error("Failed to fetch user in navbar:", err);
          // Fallback to token payload if fetch fails
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser(payload);
          } catch (e) {
            console.error("Invalid token");
          }
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-b border-border/40 dark:border-slate-800 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  E
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground">TestKiller</h1>
            </Link>

            <div className="hidden md:flex items-center gap-8 relative">
              {/* Active Tab Background */}
              {activeRect && (
                <motion.div
                  className="absolute bg-primary rounded-full -z-10"
                  initial={false}
                  animate={{
                    left: activeRect.left,
                    width: activeRect.width,
                    height: activeRect.height,
                    top: activeRect.top,
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {links.map((link) => {
                const isActive = link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    ref={(el) => {
                      if (isActive && el) {
                        navRefs.current[link.href] = el;
                      } else if (el) {
                        navRefs.current[link.href] = el;
                      }
                    }}
                    onMouseEnter={() => setHoveredPath(link.href)}
                    onMouseLeave={() => setHoveredPath(null)}
                    className={`relative px-4 py-2 rounded-full transition-colors ${isActive || link.href === hoveredPath ? "text-primary-foreground" : "text-foreground hover:text-foreground"
                      }`}
                  >
                    {link.href === hoveredPath && !isActive && (
                      <motion.span
                        layoutId="navbar-hover"
                        className="absolute inset-0 bg-accent rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        initial={false}
                      />
                    )}
                    <span className="relative z-10 font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(user.name || user.username)?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleDarkMode}>
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="bg-primary hover:bg-accent text-primary-foreground">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-28 right-8 z-50 p-3 bg-white/50 backdrop-blur-md border border-white/20 text-primary rounded-full shadow-lg hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
