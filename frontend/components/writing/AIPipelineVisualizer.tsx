"use client";

import React, { useEffect, useState } from "react";
import { 
  FileText, 
  Scissors, 
  Search, 
  Database, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "waiting" | "active" | "done";
}

interface AIPipelineVisualizerProps {
  currentStatus?: string; // "processing" | "done"
  activeStepIndex?: number;
  autoProgressing?: boolean;
}

export const AIPipelineVisualizer = ({ 
  currentStatus = "done", 
  activeStepIndex = -1,
  autoProgressing = false 
}: AIPipelineVisualizerProps) => {
  const [internalActiveStep, setInternalActiveStep] = useState(0);
  
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "input",
      title: "Input Essay",
      description: "Nhận bài viết từ người dùng",
      icon: <FileText className="w-5 h-5" />,
      status: "done"
    },
    {
      id: "nlp",
      title: "NLP Splitter",
      description: "Phân tách câu & Paragraphs",
      icon: <Scissors className="w-5 h-5" />,
      status: "waiting"
    },
    {
      id: "micro",
      title: "Micro-Evaluator",
      description: "Soi lỗi ngữ pháp từng câu",
      icon: <Search className="w-5 h-5" />,
      status: "waiting"
    },
    {
      id: "feature",
      title: "Feature Builder",
      description: "Chuẩn hóa ma trận đặc trưng",
      icon: <Zap className="w-5 h-5" />,
      status: "waiting"
    },
    {
      id: "rag",
      title: "GraphRAG Context",
      description: "Truy xuất Neo4j & Vector DB",
      icon: <Network className="w-5 h-5" />,
      status: "waiting"
    },
    {
      id: "macro",
      title: "Macro Judge",
      description: "AI Gemini chấm điểm tổng quát",
      icon: <BrainCircuit className="w-5 h-5" />,
      status: "waiting"
    },
    {
      id: "output",
      title: "Result",
      description: "Xuất Band Score & Scaffolding",
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: "waiting"
    }
  ]);

  useEffect(() => {
    if (autoProgressing && currentStatus === "processing") {
      const interval = setInterval(() => {
        setInternalActiveStep(prev => (prev < 6 ? prev + 1 : prev));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoProgressing, currentStatus]);

  useEffect(() => {
    if (currentStatus === "done") {
      setSteps(prev => prev.map(s => ({ ...s, status: "done" })));
    } else {
      const targetStep = autoProgressing ? internalActiveStep : activeStepIndex;
      setSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx < targetStep ? "done" : idx === targetStep ? "active" : "waiting"
      })));
    }
  }, [currentStatus, activeStepIndex, internalActiveStep, autoProgressing]);

  return (
    <div className="w-full py-8 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[800px] px-4 relative">
        {/* Connection Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
        
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="relative z-10 flex flex-col items-center group">
              {/* Node Circle */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-lg",
                step.status === "done" ? "bg-primary border-primary text-white" : 
                step.status === "active" ? "bg-white dark:bg-slate-900 border-primary text-primary animate-pulse scale-110 shadow-primary/20" : 
                "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400"
              )}>
                {step.icon}
                
                {/* Status Indicator */}
                {step.status === "active" && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors duration-300",
                  step.status === "waiting" ? "text-slate-400" : "text-slate-900 dark:text-slate-100"
                )}>
                  {step.title}
                </p>
                <p className="text-[9px] text-muted-foreground max-w-[100px] leading-tight">
                  {step.description}
                </p>
              </div>

              {/* Step Number Tooltip (hover) */}
              <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Step {idx + 1}
              </div>
            </div>

            {/* Connection Arrow */}
            {idx < steps.length - 1 && (
              <div className={cn(
                "relative z-10 transition-colors duration-500",
                steps[idx].status === "done" ? "text-primary" : "text-slate-300 dark:text-slate-700"
              )}>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Decorative Glow Background */}
      <div className="mt-8 flex justify-center">
        <div className="px-4 py-2 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-medium text-primary uppercase tracking-widest">
            {currentStatus === "done" ? "Pipeline Execution Complete" : "Pipeline Processing Active..."}
          </span>
        </div>
      </div>
    </div>
  );
};
