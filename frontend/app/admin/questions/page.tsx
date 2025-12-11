"use client";

import Link from "next/link";
import { 
    Headphones, 
    BookOpen, 
    PenTool, 
    Mic, 
    ChevronRight,
    HelpCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const questionTypes = [
    {
        title: "Listening Questions",
        description: "Manage audio files, transcripts, and question sets.",
        icon: Headphones,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        href: "/admin/skills/listening/questions"
    },
    {
        title: "Reading Passages",
        description: "Manage reading texts and comprehension questions.",
        icon: BookOpen,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/20",
        href: "/admin/skills/reading/questions"
    },
    {
        title: "Writing Prompts",
        description: "Manage Task 1 and Task 2 essay questions.",
        icon: PenTool,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        href: "/admin/skills/writing/questions"
    },
    {
        title: "Speaking Topics",
        description: "Manage Part 1, 2, 3 speaking cues and questions.",
        icon: Mic,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        href: "/admin/skills/speaking/questions"
    }
];

export default function QuestionsPage() {
    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Question Bank</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Select a skill to manage its question repository.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questionTypes.map((type) => (
                    <Link key={type.title} href={type.href} className="group">
                        <Card className="h-full border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl ${type.bg} flex items-center justify-center mb-4`}>
                                    <type.icon className={`w-6 h-6 ${type.color}`} />
                                </div>
                                <CardTitle className="flex items-center justify-between">
                                    {type.title}
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                </CardTitle>
                                <CardDescription className="text-base">{type.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <HelpCircle className="w-6 h-6 text-slate-500 mt-1" />
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Note about Question Bank</h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Questions added here can be used to construct full functionality Exams. 
                            Currently, exams are assembled by selecting questions from this bank.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
