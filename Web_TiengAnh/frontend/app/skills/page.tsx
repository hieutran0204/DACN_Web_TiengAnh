"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, BookOpen, PenTool, Headphones } from "lucide-react";

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
    },
    {
      id: 2,
      icon: BookOpen,
      title: "Reading",
      description:
        "Enhance comprehension and speed reading skills with diverse texts",
      lessons: 52,
      progress: 45,
    },
    {
      id: 3,
      icon: Mic,
      title: "Speaking",
      description:
        "Build confidence and fluency in spoken English communication",
      lessons: 38,
      progress: 28,
    },
    {
      id: 4,
      icon: PenTool,
      title: "Writing",
      description:
        "Master writing skills from basic sentences to complex essays",
      lessons: 41,
      progress: 71,
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Skill Tests
            </h1>
            <p className="text-lg text-muted-foreground">
              Assess your listening, reading, writing, and speaking abilities
              with targeted skill assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <Card
                  key={skill.id}
                  className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {skill.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {skill.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {skill.lessons} Lessons
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {skill.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-accent text-primary-foreground">
                    Continue Learning
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
