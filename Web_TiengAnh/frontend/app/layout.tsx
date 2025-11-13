import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatBox } from "@/components/chat-box";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TestKiller - Learn English Online",
  description:
    "Master English with interactive lessons, games, tests, and comprehensive assessments",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <div className="flex flex-col flex-1 w-full">{children}</div>
        </SidebarProvider>

        {/* ✅ Global Chat + Analytics (bỏ toast) */}
        <ChatBox />
        <Analytics />
      </body>
    </html>
  );
}
