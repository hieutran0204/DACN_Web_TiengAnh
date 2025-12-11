"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
    ChevronLeft, 
    FileText, 
    Calendar,
    Trophy,
    ArrowRight,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

interface Submission {
    _id: string;
    exam: {
        _id: string;
        title: string;
    };
    overallBand: number;
    submittedAt: string;
}

export default function WritingHistoryPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/user/writing-exam/my-submissions")
            .then((res: any) => {
                if (res.success) {
                    setSubmissions(res.data);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
             <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="container max-w-5xl mx-auto h-16 flex items-center gap-4">
                    <Link href="/tests/writing" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Tests
                    </Link>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        My Writing History
                    </h1>
                </div>
            </header>

            <div className="container max-w-5xl mx-auto py-8">
                {submissions.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No submissions yet</h2>
                        <p className="text-muted-foreground mb-6">You haven't taken any writing tests yet.</p>
                        <Button asChild>
                            <Link href="/tests/writing">Start a Test</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {submissions.map((sub) => (
                            <Link key={sub._id} href={`/tests/writing/result/${sub._id}`}>
                                <Card className="hover:shadow-md transition-all group border-l-4 border-l-primary hover:border-l-purple-500">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300">
                                                <Trophy className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                                                    {sub.exam?.title || "Unknown Exam"}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(sub.submittedAt), "PPP p")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Band</div>
                                                <Badge variant="secondary" className="text-xl px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                                                    {sub.overallBand}
                                                </Badge>
                                            </div>
                                            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
