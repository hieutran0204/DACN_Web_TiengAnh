"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-primary/5" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-8">
                        <Sparkles className="w-4 h-4" />
                        <span>Start your journey today</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
                        Ready to Master English?
                    </h2>

                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Join thousands of students achieving their language goals with our
                        comprehensive learning platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto gap-2" asChild>
                            <Link href="/register">
                                Get Started for Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 h-14 w-full sm:w-auto"
                            asChild
                        >
                            <Link href="/tests">Explore Tests</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
