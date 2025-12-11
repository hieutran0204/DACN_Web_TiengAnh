"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Users,
  Trophy,
  Play,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalAttempts?: number;
  questionCount: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  };
}

export default function TestsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/exam?isPublished=true")
      .then((res: any) => {
        const data = res.success && res.data ? res.data : [];
        setExams(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi load đề:", err);
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const skillStats = {
    listening: exams.filter((e) => e.questionCount.listening > 0).length,
    reading: exams.filter((e) => e.questionCount.reading > 0).length,
    writing: exams.filter((e) => e.questionCount.writing > 0).length,
    speaking: exams.filter((e) => e.questionCount.speaking > 0).length,
  };

  const totalAttempts = exams.reduce(
    (sum, e) => sum + (e.totalAttempts || 0),
    0
  );

  const totalQuestions = {
    listening: exams.reduce((sum, e) => sum + e.questionCount.listening, 0),
    reading: exams.reduce((sum, e) => sum + e.questionCount.reading, 0),
    writing: exams.reduce((sum, e) => sum + e.questionCount.writing, 0),
    speaking: exams.reduce((sum, e) => sum + e.questionCount.speaking, 0),
  };

  const skills = [
    {
      title: "Listening Tests",
      icon: Headphones,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/20",
      count: skillStats.listening,
      questions: totalQuestions.listening,
      duration: "30-40 mins",
      path: "/tests/listening",
    },
    {
      title: "Reading Tests",
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-500/10",
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/20",
      count: skillStats.reading,
      questions: totalQuestions.reading,
      duration: "60 mins",
      path: "/tests/reading",
    },
    {
      title: "Writing Tests",
      icon: PenTool,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/20",
      count: skillStats.writing,
      questions: totalQuestions.writing,
      duration: "60 mins",
      path: "/tests/writing",
    },
    {
      title: "Speaking Tests",
      icon: Mic,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      gradient: "from-orange-500/20 to-red-500/20",
      border: "border-orange-500/20",
      count: skillStats.speaking,
      questions: totalQuestions.speaking,
      duration: "11-14 mins",
      path: "/tests/speaking",
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto" />
            <Skeleton className="h-6 w-2/3 md:w-1/3 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
                <Trophy className="w-4 h-4" />
                <span>Premium IELTS Preparation</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                Full IELTS{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Mock Tests
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience realistic exam conditions with our comprehensive mock
                tests. Get instant AI scoring, detailed feedback, and accurate
                band score predictions.
              </p>
            </motion.div>
          </div>

          {/* Skill Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={skill.path} className="block h-full">
                    <div className="group relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      {/* Card Gradient Background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${skill.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />

                      <div className="relative p-8 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-8">
                          <div
                            className={`w-16 h-16 rounded-2xl ${skill.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className={`w-8 h-8 ${skill.color}`} />
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-sm px-3 py-1 font-semibold bg-background/80 backdrop-blur-md"
                          >
                            {skill.count} Tests Available
                          </Badge>
                        </div>

                        <h3 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                          {skill.title}
                        </h3>

                        <div className="space-y-3 mb-8 flex-1">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span>{skill.questions} practice questions</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span>{skill.duration} per test</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Users className="w-5 h-5 text-purple-500" />
                            <span>
                              {totalAttempts.toLocaleString()} attempts
                            </span>
                          </div>
                        </div>

                        <Button
                          size="lg"
                          className="w-full h-14 text-lg font-semibold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-lg"
                        >
                          Start Practicing <Play className="w-5 h-5 ml-2 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-purple-600/90 backdrop-blur-xl" />
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Join <span className="text-yellow-300">150,000+</span> Students
                Achieving Band 7.0+
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Accuracy", value: "98%" },
                  { label: "Updated", value: "2025" },
                  { label: "AI Scoring", value: "Instant" },
                  { label: "Support", value: "24/7" },
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                      {stat.value}
                    </div>
                    <div className="text-white/80 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
