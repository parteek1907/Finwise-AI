"use client";

import { motion } from "framer-motion";
import { BookOpen, LineChart, Shield, LayoutGrid } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    lesson: "Knowledge compounds faster than money.",
    desc: "Experience story-based financial lessons where your choices change the outcome. No boring videos or PDFs. Just you and scenarios that test your decision-making."
  },
  {
    icon: LayoutGrid,
    title: "Mission Control",
    lesson: "A healthy financial life is structured.",
    desc: "Navigate your financial health, learning goals, and achievements through an immersive 3D workspace. It's not a dashboard; it's your personal growth universe."
  },
  {
    icon: Shield,
    title: "Scam Detection",
    lesson: "Greed and fear are the scammer's best friends.",
    desc: "Paste any suspicious WhatsApp message, email, or SMS. Our AI instantly analyzes claims, detects red flags, and protects you before you make a mistake."
  },
  {
    icon: LineChart,
    title: "Virtual Market",
    lesson: "Every loss is tuition paid to the market.",
    desc: "Practice investing with real-time prices in a risk-free environment. Instead of punishing losses, our AI helps you reflect on what the trade taught you."
  }
];

export function FeatureCards() {
  return (
    <section className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-background rounded-[32px] p-10 border border-border/50 hover:border-white/10 transition-colors shadow-sm relative overflow-hidden"
            >
              {/* Soft abstract glow in the corner */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-foreground/5 rounded-full blur-3xl pointer-events-none group-hover:bg-foreground/10 transition-colors" />

              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center border border-border mb-8">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              
              <h3 className="text-2xl font-heading font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              
              {/* The "Lesson" sub-header */}
              <p className="text-gold font-medium mb-6 text-sm uppercase tracking-wide">
                {feature.lesson}
              </p>
              
              <p className="text-secondary leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
