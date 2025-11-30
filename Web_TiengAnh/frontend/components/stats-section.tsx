"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Trophy, Star } from "lucide-react";

const stats = [
    {
        id: 1,
        label: "Active Students",
        value: "10k+",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        id: 2,
        label: "Practice Tests",
        value: "500+",
        icon: BookOpen,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        id: 3,
        label: "Success Rate",
        value: "98%",
        icon: Trophy,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        id: 4,
        label: "User Rating",
        value: "4.9/5",
        icon: Star,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-accent/50 transition-colors"
                        >
                            <div className={`p-4 rounded-full ${stat.bg} mb-4`}>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                            <h3 className="text-4xl font-bold text-foreground mb-2">
                                {stat.value}
                            </h3>
                            <p className="text-muted-foreground font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
