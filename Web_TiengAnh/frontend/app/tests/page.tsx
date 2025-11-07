"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, Trophy } from "lucide-react";

export default function TestsPage() {
  const tests = [
    {
      id: 1,
      title: "TOEFL Practice Test",
      duration: "180 minutes",
      questions: 120,
      difficulty: "Intermediate",
      attempts: 1245,
    },
    {
      id: 2,
      title: "IELTS Mock Exam",
      duration: "170 minutes",
      questions: 100,
      difficulty: "Intermediate",
      attempts: 987,
    },
    {
      id: 3,
      title: "English Proficiency Test",
      duration: "90 minutes",
      questions: 50,
      difficulty: "Beginner",
      attempts: 2341,
    },
    {
      id: 4,
      title: "Advanced Grammar Test",
      duration: "60 minutes",
      questions: 40,
      difficulty: "Advanced",
      attempts: 543,
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Mock Tests
            </h1>
            <p className="text-lg text-muted-foreground">
              Prepare for TOEFL, IELTS, and other English proficiency tests with
              realistic practice exams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Card
                key={test.id}
                className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {test.title}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {test.difficulty}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <BarChart3 className="w-5 h-5" />
                    <span>{test.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Trophy className="w-5 h-5" />
                    <span>
                      {test.attempts.toLocaleString()} people attempted
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-accent text-primary-foreground">
                  Start Test
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
