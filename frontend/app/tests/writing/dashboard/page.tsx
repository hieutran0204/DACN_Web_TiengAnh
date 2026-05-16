"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    ChevronLeft, 
    BrainCircuit, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle2, 
    History,
    Loader2,
    Info
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

interface ProfileData {
    studentId: string;
    stats: {
        totalEssays: number;
        topErrors: Array<{ error: string; count: number; lastSeen: string }>;
        topStrengths: Array<{ strength: string; score: number }>;
        recentEssays: Array<{ essayId: string; timestamp: string }>;
    };
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function WritingDashboardPage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/user/writing-exam/dashboard")
            .then((res: any) => {
                if (res.success) {
                    setData(res.data);
                }
            })
            .catch((err) => console.error("Failed to fetch dashboard:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Analyzing your GraphRAG profile...</p>
                </div>
            </div>
        );
    }

    if (!data || data.stats.totalEssays === 0) {
        return (
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
                 <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="container max-w-6xl mx-auto h-16 flex items-center gap-4 px-4">
                        <Link href="/tests/writing" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </Link>
                    </div>
                </header>
                <div className="container max-w-6xl mx-auto py-20 px-4 text-center">
                    <BrainCircuit className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
                    <h2 className="text-2xl font-bold mb-4">Insufficient Data</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Our AI needs at least a few essays to build your personalized grammar profile. 
                        Keep writing to see deep insights into your learning progress!
                    </p>
                    <Button asChild size="lg">
                        <Link href="/tests/writing">Start Writing Now</Link>
                    </Button>
                </div>
            </main>
        );
    }

    const errorData = data.stats.topErrors.map(e => ({
        name: e.error.replace("E_", ""),
        count: e.count
    }));

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/tests/writing" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </Link>
                        <div className="h-6 w-px bg-border" />
                        <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Grammar Mastery Dashboard
                        </h1>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                        GraphRAG Enabled
                    </Badge>
                </div>
            </header>

            <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-xl shadow-purple-500/20">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Total Essays Analyzed</p>
                                    <h3 className="text-4xl font-black mt-1">{data.stats.totalEssays}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-purple-100">
                                Across all IELTS tasks and practice sessions.
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                CRITICAL ERROR AREAS
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.stats.topErrors.length} Categories</div>
                            <p className="text-xs text-muted-foreground mt-1">Found consistently across your writing.</p>
                            <div className="mt-4 flex gap-1">
                                {data.stats.topErrors.slice(0, 3).map(e => (
                                    <Badge key={e.error} variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-100">
                                        {e.error.replace("E_", "")}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                PERFORMANCE STRENGTHS
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.stats.topStrengths.length} Mastered</div>
                            <p className="text-xs text-muted-foreground mt-1">Concepts you use with high accuracy.</p>
                            <div className="mt-4 flex gap-1">
                                {data.stats.topStrengths.slice(0, 3).map(s => (
                                    <Badge key={s.strength} variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100">
                                        {s.strength}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Error Distribution Chart */}
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Recurring Errors (Frequency)
                            </CardTitle>
                            <CardDescription>Which grammar rules are you struggling with most?</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={errorData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={100} 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                        {errorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Detailed Analysis */}
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-purple-600" />
                                Conceptual Mastery
                            </CardTitle>
                            <CardDescription>Accuracy scores for advanced structures.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.stats.topStrengths.map((s, idx) => (
                                <div key={s.strength} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>{s.strength}</span>
                                        <span className="text-purple-600">{(s.score * 10).toFixed(1)}% Accuracy</span>
                                    </div>
                                    <Progress value={s.score * 10} className="h-2 bg-slate-100" />
                                </div>
                            ))}
                            {data.stats.topStrengths.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground italic">
                                    Continue writing to unlock conceptual mastery scores.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Timeline */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            Recent Knowledge Integration
                        </CardTitle>
                        <CardDescription>Tracking your learning path through each submission.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800 before:ml-4">
                            {data.stats.recentEssays.map((essay, idx) => (
                                <div key={essay.essayId} className="relative pl-12">
                                    <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 z-10" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Essay Submission #{essay.essayId.substring(0, 8)}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Analyzed on {new Date(essay.timestamp).toLocaleDateString()} at {new Date(essay.timestamp).toLocaleTimeString()}
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                                <Link href={`/tests/writing/result/${essay.essayId}`}>View Result</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
