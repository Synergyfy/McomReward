"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { TierConfig } from "@/services/loyalty-setup/types";
import FieldRequirementHint from "@/components/onboarding/FieldRequirementHint";
import { formTypography } from "./formTypography";
import SetupProgress from "./SetupProgress";

interface TiersScreenProps {
  initialConfig: TierConfig | null;
  onComplete: (config: TierConfig) => void;
  onBack: () => void;
  onSkip: () => void;
}

const TIER_COLORS = ["bg-orange-100 text-orange-700", "bg-gray-100 text-gray-700", "bg-yellow-100 text-yellow-700", "bg-slate-100 text-slate-700"];

export default function TiersScreen({ initialConfig, onComplete, onBack, onSkip }: TiersScreenProps) {
  const [config, setConfig] = useState<TierConfig>(() => initialConfig || { enabled: false, tiers: [] });

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
    <div className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto max-w-3xl px-4 pb-3 pt-3 sm:px-7 sm:pb-12 sm:pt-6 md:pb-16 md:pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 max-sm:mb-3 max-sm:py-1.5">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <SetupProgress currentStep={3} className="mb-8 max-sm:mb-3" />
          <div className="mb-7 sm:mb-8">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600">MCOM Rewards setup</p>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-950 sm:text-3xl">Set up customer tiers</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Review the tiers supplied with your rewards template. Adjust how customers qualify and what they receive.</p>
          </div>

          <Card className="mb-5 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`font-semibold text-slate-900 ${formTypography.section}`}>Tier programme</h2>
                  <Badge className={config.enabled ? "border-0 bg-emerald-50 text-emerald-700" : "border-0 bg-slate-100 text-slate-600"}>{config.enabled ? "On" : "Off"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">Turn this on to let customers unlock the tiers below.</p>
              </div>
              <Switch aria-label="Enable customer tier programme" checked={config.enabled} onCheckedChange={(v) => setConfig((prev) => ({ ...prev, enabled: v }))} />
            </div>
          </Card>

          {config.enabled && config.tiers.length > 0 ? (
            <div className="mb-7 grid gap-4 lg:grid-cols-2">
              {config.tiers.map((tier, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="h-full border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${TIER_COLORS[idx] || TIER_COLORS[0]}`}>{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`tier-name-${idx}`} className={`text-xs font-medium text-slate-500 ${formTypography.label}`}>Tier name<FieldRequirementHint kind="important" /></Label>
                        <Input id={`tier-name-${idx}`} value={tier.name} onChange={(e) => updateTier(idx, "name", e.target.value)} className={`mt-1 h-9 font-semibold ${formTypography.value}`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label className={`text-xs font-medium text-slate-500 ${formTypography.label}`}>Qualifies by<FieldRequirementHint kind="important" /></Label>
                        <Select value={tier.requirementType} onValueChange={(v) => updateTier(idx, "requirementType", v)}>
                          <SelectTrigger className={`mt-1 text-sm ${formTypography.value}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="points">Points earned</SelectItem>
                            <SelectItem value="spend">Total spend (£)</SelectItem>
                            <SelectItem value="purchases">Number of purchases</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className={`text-xs font-medium text-slate-500 ${formTypography.label}`}>Minimum required<FieldRequirementHint kind="important" /></Label>
                        <Input type="number" min={0} value={tier.requirementValue} onChange={(e) => updateTier(idx, "requirementValue", Number(e.target.value))} className={`mt-1 text-sm ${formTypography.value}`} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label htmlFor={`tier-benefits-${idx}`} className={`text-xs font-medium text-slate-500 ${formTypography.label}`}>Customer benefits<FieldRequirementHint kind="important" /></Label>
                      <Input id={`tier-benefits-${idx}`} value={tier.benefits.join(", ")} onChange={(e) => updateTierBenefits(idx, e.target.value)} className={`mt-1 text-sm ${formTypography.value}`} placeholder="e.g. Double points, Free delivery" />
                    </div>
                  </Card>
                </motion.div>
              ))}

            </div>
          ) : config.enabled ? (
            <Card className="mb-7 border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <h3 className="font-semibold text-slate-900">No customer tiers configured</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">There are no customer loyalty tiers in this rewards template yet. You can continue without tiers or ask an administrator to add them to the template.</p>
            </Card>
          ) : null}

          <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onSkip} className="order-2 text-slate-500 hover:text-slate-800 sm:order-1">Skip tiers</Button>
            <Button size="lg" onClick={() => onComplete(config)} className="order-1 w-full rounded-xl bg-orange-500 px-8 py-5 text-base font-semibold text-white shadow-md shadow-orange-200/70 transition-all hover:bg-orange-600 sm:order-2 sm:w-auto sm:min-w-[220px]">
              Continue<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
