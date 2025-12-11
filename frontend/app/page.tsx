"use client";

import Hero from "@/components/hero";
import Features from "@/components/features";
import StatsSection from "@/components/stats-section";
import CTASection from "@/components/cta-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Hero />
      <StatsSection />
      <Features />
      <CTASection />
    </main>
  );
}
