import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Trophy, Zap } from 'lucide-react';
import { ProgressionLevel } from '@/services/progression/types';
import { motion } from 'framer-motion';

interface ProgressionBenefitsProps {
  levels: ProgressionLevel[];
  currentLevelName: string;
}

const levelIcons: Record<string, any> = {
  'Standard': Zap,
  'Pro': Trophy,
  'Pro Plus': Sparkles,
};

export default function ProgressionBenefits({ levels, currentLevelName }: ProgressionBenefitsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-6 w-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-slate-800">Growth Tiers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((level, index) => {
          const isCurrent = level.level === currentLevelName || level.isCurrent;
          const Icon = levelIcons[level.level] || Zap;

          // Map benefits from Record<string, any> to an array of strings
          const benefitsArray = level.benefits ? Object.entries(level.benefits).map(([key, value]) => {
            if (typeof value === 'boolean') return value ? key : null;
            if (typeof value === 'string' || typeof value === 'number') return `${key}: ${value}`;
            return key;
          }).filter(Boolean) as string[] : [];

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${isCurrent
                  ? 'bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-xl shadow-orange-500/10'
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
            >
              {isCurrent && (
                <div className="absolute top-3 right-3">
                  <span className="bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Current Level
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isCurrent ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  <Icon size={24} />
                </div>

                <h3 className={`text-xl font-bold mb-4 ${isCurrent ? 'text-orange-600' : 'text-slate-800'}`}>
                  {level.level}
                </h3>

                <ul className="space-y-3">
                  {benefitsArray.length > 0 ? benefitsArray.map((benefit, bIndex) => (
                    <li key={bIndex} className="flex items-start gap-3">
                      <div className={`mt-1 p-0.5 rounded-full ${isCurrent ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                        }`}>
                        <Check size={12} />
                      </div>
                      <span className="text-sm text-slate-600 leading-tight">{benefit}</span>
                    </li>
                  )) : (
                    <li className="text-sm text-slate-400 italic">No specific benefits listed</li>
                  )}
                </ul>
              </div>

              {!isCurrent && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
