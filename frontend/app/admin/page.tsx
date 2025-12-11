"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Activity, TrendingUp, BookOpen, Gamepad2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/dashboard/stats")
      .then((res) => {
        if (res.success) {
          setStats(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome back, Admin! Here's the realtime system status.</p>
      </div>

      {/* STATS GRID */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard 
            title="Total Users" 
            value={stats?.totalUsers ?? "..."} 
            loading={loading}
            icon={Users} 
            color="bg-blue-500" 
            href="/admin/users"
        />
        <StatsCard 
            title="Total Exams" 
            value={stats?.totalExams ?? "..."} 
            loading={loading}
            icon={FileText} 
            color="bg-purple-500"
            href="/admin/exams" 
        />
        <StatsCard 
            title="Total Submissions" 
            value={stats?.totalSubmissions ?? "..."} 
            loading={loading}
            icon={Activity} 
            color="bg-green-500" 
        />
        <StatsCard 
            title="Avg. Band Score" 
            value="6.5" 
            loading={false}
            change="+0.2"
            icon={TrendingUp} 
            color="bg-amber-500" 
        />
      </motion.div>

      {/* RECENT ACTIVITY & QUICK LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT SUBMISSIONS */}
        <div className="lg:col-span-2">
            <Card className="h-full border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Recent Submissions
                    </CardTitle>
                    <CardDescription>Latest user exam activities</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : stats?.recentSubmissions?.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentSubmissions.map((sub: any) => (
                                <div key={sub._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                            {sub.user?.username?.substring(0,2).toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{sub.user?.username || "Unknown User"}</p>
                                            <p className="text-xs text-slate-500">{sub.exam?.title || "Unknown Exam"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600 dark:text-green-400">Band {sub.overallBand}</div>
                                        <div className="text-xs text-slate-400">{sub.submittedAt ? format(new Date(sub.submittedAt), 'MMM dd, HH:mm') : '-'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400">
                            No recent activity found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <CardHeader>
                    <CardTitle>Quick Access</CardTitle>
                    <CardDescription className="text-purple-100">Manage your platform content</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                     <Link href="/admin/questions" className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer">
                        <BookOpen className="w-8 h-8 mb-2" />
                        <span className="text-sm font-semibold">Questions</span>
                     </Link>
                     <Link href="/admin/gamess" className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer">
                        <Gamepad2 className="w-8 h-8 mb-2" />
                        <span className="text-sm font-semibold">Games</span>
                     </Link>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-orange-50 dark:bg-orange-900/10 border-orange-200">
                <CardHeader>
                    <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Pending Reviews
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-orange-900/70 dark:text-orange-300/70 text-sm">
                        There are 3 reported questions needing your attention.
                    </p>
                    <Link href="/admin/questions" className="text-orange-600 dark:text-orange-400 text-sm font-semibold mt-2 inline-block hover:underline">
                        Review now &rarr;
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon, color, loading, href }: any) {
    const CardWrapper = ({ children }: any) => href ? <Link href={href} className="block">{children}</Link> : <>{children}</>;

    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <CardWrapper>
                <Card className="border-none shadow-lg overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                                {loading ? (
                                    <Skeleton className="h-8 w-16 mt-2" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</h3>
                                )}
                            </div>
                            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white shadow-inner`}>
                                <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none`} />
                                <Icon size={24} className={color.replace('bg-', 'text-')} />
                            </div>
                        </div>
                        {change && (
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-500 font-medium flex items-center">
                                    <TrendingUp size={14} className="mr-1" />
                                    {change}
                                </span>
                                <span className="text-slate-400 ml-2">vs last month</span>
                            </div>
                        )}
                    </CardContent>
                    {/* Decorative Gradient */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
                </Card>
            </CardWrapper>
        </motion.div>
    )
}
