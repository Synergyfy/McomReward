"use client";

import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Repeat, TrendingUp, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BENEFITS = [
  { icon: HeartHandshake, title: "Retain Your Customers", description: "Build lasting relationships with automated loyalty programmes that keep customers coming back." },
  { icon: Repeat, title: "Increase Repeat Purchases", description: "Reward repeat behaviour with points, stamps, and personalised offers that drive frequency." },
  { icon: TrendingUp, title: "Increase Customer Value", description: "Encourage higher spend with tiered rewards, gift cards, and targeted campaigns." },
  { icon: Zap, title: "Simple & Automated", description: "Everything is pre-configured for your business type. Activate in minutes, not hours." },
];

interface WelcomeScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function WelcomeScreen({ onComplete, onSkip }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mb-6">
            <span className="text-3xl font-bold text-orange-600 tracking-tight">Loyalty CardX</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Welcome to MCOM<br /><span className="text-orange-600">Reward & Loyalty</span></h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">Your all-in-one loyalty activation platform. We already understand your business — now let&apos;s set up the tools to reward your customers.</p>
        </div>
        <div className="grid gap-4 mb-10 text-left">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={benefit.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card className="p-4 flex items-start gap-4 border border-orange-100 bg-white/80 hover:bg-orange-50/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Icon className="w-5 h-5 text-orange-600" /></div>
                  <div><h3 className="font-semibold text-gray-900">{benefit.title}</h3><p className="text-sm text-gray-500 mt-0.5">{benefit.description}</p></div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={onComplete} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">
            Start Setup<ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={onComplete} className="px-8 py-6 text-lg rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50">
            <Play className="mr-2 w-5 h-5" />View Demo
          </Button>
          <Button size="lg" variant="ghost" onClick={onSkip} className="px-8 py-6 text-lg rounded-xl text-gray-400 hover:text-gray-600">
            Skip For Now
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
