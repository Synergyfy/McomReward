import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, CircleDashed, Rocket, Star, ShieldCheck } from 'lucide-react';
import { ProgressionLevel } from '@/services/progression/types';
import { motion } from 'framer-motion';

interface ProgressionCardProps {
  currentLevelName: string;
  nextLevel: ProgressionLevel;
}

export default function ProgressionCard({ currentLevelName, nextLevel }: ProgressionCardProps) {
  // Calculate aggregate progress from requirements
  const totalTarget = nextLevel.requirements.reduce((acc, req) => acc + (typeof req.target === 'number' ? req.target : 0), 0);
  const totalCurrent = nextLevel.requirements.reduce((acc, req) => acc + (typeof req.current === 'number' ? req.current : 0), 0);
  const progress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <Card className="overflow-hidden border-none bg-slate-900/50 backdrop-blur-xl shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
          <Rocket className="text-orange-500 h-6 w-6" />
          <span>Road to {nextLevel.level}</span>
        </CardTitle>
        <p className="text-slate-400 text-sm">
          You're {progress}% of the way to unlocking next-level benefits
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative pt-4">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className="text-orange-400">{currentLevelName}</span>
            <span className="text-slate-500">{progress}%</span>
            <span className="text-amber-400">{nextLevel.level}</span>
          </div>
          <Progress
            value={progress}
            className="h-3 bg-slate-800"
            // @ts-ignore - custom className for progress indicator if available
            indicatorClassName="bg-gradient-to-r from-orange-600 to-amber-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
          />
        </div>

        <div className="grid gap-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Star className="h-4 w-4 text-amber-500" />
            Milestones for {nextLevel.level}
          </h4>

          <div className="grid gap-3">
            {nextLevel.requirements.map((req, index) => {
              const isCompleted = req.isCompleted;
              const currentVal = typeof req.current === 'number' ? req.current : 0;
              const targetVal = typeof req.target === 'number' ? req.target : 0;

              return (
                <motion.div
                  key={req.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${isCompleted
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-slate-800/40 border border-slate-700/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
                      }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <CircleDashed className="h-5 w-5 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {req.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isCompleted ? 'Task completed' : `${req.remaining} more to go`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                      {currentVal}/{targetVal}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Benefits text from backend if available, otherwise generic */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 text-[12px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            <span>Advancing to <strong>{nextLevel.level}</strong> will unlock new premium features and privileges.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
