"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, BookOpen, PenTool, Headphones, Zap, ArrowRight } from "lucide-react";

export default function SkillsPage() {
  const skills = [
    {
      id: 1,
      icon: Headphones,
      title: "Listening",
      description:
        "Improve your ability to understand spoken English in various contexts",
      lessons: 45,
      progress: 62,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: 2,
      icon: BookOpen,
      title: "Reading",
      description:
        "Enhance comprehension and speed reading skills with diverse texts",
      lessons: 52,
      progress: 45,
      color: "text-green-500",
      bg: "bg-green-500/10",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: 3,
      icon: Mic,
      title: "Speaking",
      description:
        "Build confidence and fluency in spoken English communication",
      lessons: 38,
      progress: 28,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      id: 4,
      icon: PenTool,
      title: "Writing",
      description:
        "Master writing skills from basic sentences to complex essays",
      lessons: 41,
      progress: 71,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Targeted Skill Practice</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                Master Every{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  Skill
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Assess and improve your listening, reading, writing, and speaking
                abilities with our comprehensive curriculum.
              </p>
            </motion.div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="group relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    {/* Card Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${skill.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative p-8 flex flex-col h-full">
                      <div className="flex items-start gap-6 mb-6">
                        <div
                          className={`p-4 rounded-2xl ${skill.bg} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-8 h-8 ${skill.color}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {skill.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {skill.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-foreground">
                              {skill.lessons} Lessons
                            </span>
                            <span className="text-primary">
                              {skill.progress}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="bg-primary h-full rounded-full"
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full h-12 text-base font-medium rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
