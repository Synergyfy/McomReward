"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Star, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PointsEngineConfig, BonusPointRule } from "@/services/loyalty-setup/types";

interface PointsEngineScreenProps {
  initialConfig: PointsEngineConfig | null;
  onComplete: (config: PointsEngineConfig) => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function PointsEngineScreen({ initialConfig, onComplete, onBack, onSkip }: PointsEngineScreenProps) {
  const [config, setConfig] = useState<PointsEngineConfig>(() => initialConfig || {
    baseSpendAmount: 1,
    basePointsAwarded: 10,
    bonusPoints: [],
    matchingEnabled: false,
    matchPercentage: 100,
    pointExpiry: "12months",
  });

  const update = (field: string, value: unknown) => setConfig((prev) => ({ ...prev, [field]: value }));

  const addBonusRule = () => {
    setConfig((prev) => ({
      ...prev,
      bonusPoints: [...prev.bonusPoints, { name: "", multiplier: 2, startDate: "", endDate: "" }],
    }));
  };

  const removeBonusRule = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      bonusPoints: prev.bonusPoints.filter((_, i) => i !== idx),
    }));
  };

  const updateBonusRule = (idx: number, field: string, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      bonusPoints: prev.bonusPoints.map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }));
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
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Configure Points Engine</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Set up how customers earn and use points.</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Base Points */}
            <Card className="p-5 border border-orange-100">
              <h3 className="font-semibold text-gray-900 mb-4">Base Points</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Spend Amount (£)</Label>
                  <Input type="number" min={1} value={config.baseSpendAmount} onChange={(e) => update("baseSpendAmount", Number(e.target.value))} className="text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Points Awarded</Label>
                  <Input type="number" min={1} value={config.basePointsAwarded} onChange={(e) => update("basePointsAwarded", Number(e.target.value))} className="text-sm mt-1" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Customers earn {config.basePointsAwarded} points for every £{config.baseSpendAmount} spent</p>
            </Card>

            {/* Bonus Points */}
            <Card className="p-5 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bonus Points</h3>
                <Button variant="outline" size="sm" onClick={addBonusRule} className="text-orange-600 border-orange-300 hover:bg-orange-50">
                  <Plus className="w-4 h-4 mr-1" />Add Rule
                </Button>
              </div>
              {config.bonusPoints.length === 0 ? (
                <p className="text-sm text-gray-400">No bonus rules. Add rules like &quot;Double Points Tuesday&quot;.</p>
              ) : (
                <div className="space-y-3">
                  {config.bonusPoints.map((rule, idx) => (
                    <div key={idx} className="border border-orange-100 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input placeholder="Rule name (e.g. Double Points Tuesday)" value={rule.name} onChange={(e) => updateBonusRule(idx, "name", e.target.value)} className="text-sm flex-1 mr-2" />
                        <Button variant="ghost" size="sm" onClick={() => removeBonusRule(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-gray-500">Multiplier</Label>
                          <Select value={String(rule.multiplier)} onValueChange={(v) => updateBonusRule(idx, "multiplier", Number(v))}>
                            <SelectTrigger className="text-sm mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2x</SelectItem>
                              <SelectItem value="3">3x</SelectItem>
                              <SelectItem value="5">5x</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Start Date</Label>
                          <Input type="date" value={rule.startDate} onChange={(e) => updateBonusRule(idx, "startDate", e.target.value)} className="text-sm mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">End Date</Label>
                          <Input type="date" value={rule.endDate} onChange={(e) => updateBonusRule(idx, "endDate", e.target.value)} className="text-sm mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Matching Points */}
            <Card className="p-5 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Matching Points</h3>
                  <p className="text-xs text-gray-500">The platform matches points earned by customers</p>
                </div>
                <Switch checked={config.matchingEnabled} onCheckedChange={(v) => update("matchingEnabled", v)} />
              </div>
              {config.matchingEnabled && (
                <div>
                  <Label className="text-xs text-gray-500">Match Percentage</Label>
                  <Select value={String(config.matchPercentage)} onValueChange={(v) => update("matchPercentage", Number(v))}>
                    <SelectTrigger className="text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50% match</SelectItem>
                      <SelectItem value="100">100% match (double)</SelectItem>
                      <SelectItem value="200">200% match (triple)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">Business gives 100 points → Platform adds {config.matchPercentage} → Customer receives {100 + config.matchPercentage} points</p>
                </div>
              )}
            </Card>

            {/* Point Expiry */}
            <Card className="p-5 border border-orange-100">
              <h3 className="font-semibold text-gray-900 mb-3">Point Expiry</h3>
              <Select value={config.pointExpiry} onValueChange={(v) => update("pointExpiry", v)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never expire</SelectItem>
                  <SelectItem value="3months">Expire after 3 months</SelectItem>
                  <SelectItem value="6months">Expire after 6 months</SelectItem>
                  <SelectItem value="12months">Expire after 12 months</SelectItem>
                </SelectContent>
              </Select>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={() => onComplete(config)} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]">
              Continue<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={onSkip} className="text-gray-400 hover:text-gray-600">
              Skip — use defaults
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
