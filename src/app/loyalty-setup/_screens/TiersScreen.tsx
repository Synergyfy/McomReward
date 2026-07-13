"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Trophy, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { TierConfig, TierDefinition } from "@/services/loyalty-setup/types";

interface TiersScreenProps {
  initialConfig: TierConfig | null;
  onComplete: (config: TierConfig) => void;
  onBack: () => void;
  onSkip: () => void;
}

const TIER_COLORS = ["bg-orange-100 text-orange-700", "bg-gray-100 text-gray-700", "bg-yellow-100 text-yellow-700", "bg-slate-100 text-slate-700"];

export default function TiersScreen({ initialConfig, onComplete, onBack, onSkip }: TiersScreenProps) {
  const [config, setConfig] = useState<TierConfig>(() => initialConfig || {
    enabled: false,
    tiers: [
      { name: "Bronze", requirementType: "points", requirementValue: 0, benefits: ["Earn 1x points", "Birthday reward"] },
      { name: "Silver", requirementType: "points", requirementValue: 500, benefits: ["Earn 1.5x points", "Early access to offers"] },
      { name: "Gold", requirementType: "points", requirementValue: 1500, benefits: ["Earn 2x points", "VIP offers", "Free delivery"] },
      { name: "Platinum", requirementType: "points", requirementValue: 5000, benefits: ["Earn 3x points", "Personal manager", "Exclusive events"] },
    ],
  });

  const updateTier = (idx: number, field: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => i === idx ? { ...t, [field]: value } : t),
    }));
  };

  const updateTierBenefits = (idx: number, benefitsStr: string) => {
    const benefits = benefitsStr.split(",").map((b) => b.trim()).filter(Boolean);
    updateTier(idx, "benefits", benefits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-5">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Customer Tiers</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Set up a tier system to reward your most loyal customers with escalating benefits.</p>
          </div>

          <div className="mb-8">
            <Card className="p-5 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Tier System</h3>
                  <p className="text-sm text-gray-500">Customers progress through tiers based on their activity</p>
                </div>
                <Switch checked={config.enabled} onCheckedChange={(v) => setConfig((prev) => ({ ...prev, enabled: v }))} />
              </div>
            </Card>
          </div>

          {config.enabled && (
            <div className="space-y-4 mb-8">
              {config.tiers.map((tier, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="p-5 border border-orange-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${TIER_COLORS[idx] || TIER_COLORS[0]}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">Tier name</Label>
                        <Input value={tier.name} onChange={(e) => updateTier(idx, "name", e.target.value)} className="font-semibold text-lg h-9 mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-xs text-gray-500">Requirement</Label>
                        <p className="text-[10px] text-gray-400 mb-1">How customers qualify for this tier</p>
                        <Select value={tier.requirementType} onValueChange={(v) => updateTier(idx, "requirementType", v)}>
                          <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="points">Points earned</SelectItem>
                            <SelectItem value="spend">Total spend (£)</SelectItem>
                            <SelectItem value="purchases">Number of purchases</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Threshold</Label>
                        <p className="text-[10px] text-gray-400 mb-1">Minimum amount needed to reach this tier</p>
                        <Input type="number" min={0} value={tier.requirementValue} onChange={(e) => updateTier(idx, "requirementValue", Number(e.target.value))} className="text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Benefits (comma-separated)</Label>
                      <p className="text-[10px] text-gray-400 mb-1">Perks customers receive at this tier</p>
                      <Input value={tier.benefits.join(", ")} onChange={(e) => updateTierBenefits(idx, e.target.value)} className="text-sm" placeholder="e.g. Double points, Free delivery, VIP offers" />
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Visual preview */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {config.tiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${TIER_COLORS[idx] || TIER_COLORS[0]} border-none px-3 py-1.5 text-xs font-semibold`}>{tier.name}</Badge>
                    {idx < config.tiers.length - 1 && <span className="text-gray-300">→</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={() => onComplete(config)} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]">
              Continue<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={onSkip} className="text-gray-400 hover:text-gray-600">
              Skip — no tiers
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
