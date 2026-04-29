"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonalityCrystals } from "@/components/3d/PersonalityCrystals";
import { ArchetypeResult } from "@/components/onboarding/ArchetypeResult";
import { Sparkles } from "lucide-react";

// Mock 5-question stream for visual build
const questions = [
  {
    id: 1,
    title: "How do you view risk?",
    options: [
      { label: "Avoid at all costs", value: "a", color: "#5B8DEF", shape: "octahedron" as const },
      { label: "Calculated bet", value: "b", color: "#2BAE66", shape: "dodecahedron" as const },
      { label: "Thrill of the game", value: "c", color: "#D95C5C", shape: "icosahedron" as const }
    ]
  },
  {
    id: 2,
    title: "When the market drops 10%, you:",
    options: [
      { label: "Panic sell", value: "c", color: "#D95C5C", shape: "tetrahedron" as const },
      { label: "Do nothing", value: "a", color: "#5B8DEF", shape: "octahedron" as const },
      { label: "Buy the dip", value: "b", color: "#2BAE66", shape: "icosahedron" as const }
    ]
  },
  {
    id: 3,
    title: "Your financial goal is primarily:",
    options: [
      { label: "Security", value: "a", color: "#5B8DEF", shape: "octahedron" as const },
      { label: "Freedom", value: "b", color: "#C8A96A", shape: "dodecahedron" as const },
      { label: "Status", value: "c", color: "#D95C5C", shape: "icosahedron" as const }
    ]
  }
];

const mockArchetype = {
  name: "The Strategist",
  tagline: "Calculated, patient, and growth-oriented.",
  color: "#2BAE66",
  strengths: ["Long-term thinking", "Emotional control during dips"],
  weaknesses: ["Analysis paralysis", "Underestimating inflation risk"]
};

export function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (val: string) => {
    setAnswers([...answers, val]);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return <ArchetypeResult archetype={mockArchetype} />;
  }

  const question = questions[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-surface z-50">
        <motion.div 
          className="h-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header text */}
      <div className="pt-24 px-6 text-center z-10 flex-shrink-0">
        <div className="inline-flex items-center space-x-2 bg-surface border border-border rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs uppercase tracking-wider text-muted font-medium">Question {currentStep + 1} of {questions.length}</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-3xl md:text-5xl font-heading font-medium text-foreground max-w-2xl mx-auto leading-tight"
          >
            {question.title}
          </motion.h2>
        </AnimatePresence>
        
        <p className="mt-4 text-secondary text-sm">Drag to rotate. Tap a crystal to select.</p>
      </div>

      {/* 3D Scene Area */}
      <div className="flex-1 w-full relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <PersonalityCrystals 
              options={question.options} 
              onSelect={handleSelect} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Labels below the 3D scene (optional text helper) */}
      <div className="pb-24 px-6 z-10 flex-shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
          >
            {question.options.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2 bg-surface/50 border border-white/5 rounded-full px-4 py-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                <span className="text-sm text-secondary">{opt.label}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
