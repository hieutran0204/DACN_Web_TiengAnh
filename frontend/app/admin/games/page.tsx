"use client";

import Link from "next/link";
import { 
    Gamepad2, 
    Shapes, 
    Type, 
    ChevronRight,
    Puzzle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const gameModules = [
    {
        title: "Word Categories",
        description: "Manage vocabulary topics and themes.",
        icon: Shapes,
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        href: "/admin/game/categories"
    },
    {
        title: "Word List",
        description: "Manage individual words and definitions.",
        icon: Type,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/20",
        href: "/admin/game/words"
    },
    {
        title: "Matching Game",
        description: "Configure pairs and levels for Matching Game.",
        icon: Puzzle,
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        href: "/admin/game/matching"
    },
    {
        title: "Word Guessing",
        description: "Manage cards and topics for Word Guessing.",
        icon: Gamepad2,
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        href: "/admin/wordguessing/cards" // Separate route based on backend structure
    }
];

export default function GamesPage() {
    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Game Management</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Configure game content and vocabulary sets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gameModules.map((mod) => (
                    <Link key={mod.title} href={mod.href} className="group">
                        <Card className="h-full border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl ${mod.bg} flex items-center justify-center mb-4`}>
                                    <mod.icon className={`w-6 h-6 ${mod.color}`} />
                                </div>
                                <CardTitle className="flex items-center justify-between">
                                    {mod.title}
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                </CardTitle>
                                <CardDescription className="text-base">{mod.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
