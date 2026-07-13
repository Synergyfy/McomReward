"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Zap, Star, Stamp, MapPin, Banknote, Users, Cake, Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RewardEngineConfig } from "@/services/loyalty-setup/types";

interface RewardTypesScreenProps {
  initialConfig: RewardEngineConfig | null;
  onComplete: (config: RewardEngineConfig) => void;
  onBack: () => void;
}

const ENGINE_DEFINITIONS = [
  { key: "points" as const, icon: Star, title: "Points", desc: "Customers earn points when spending money. Redeem for rewards." },
  { key: "stamps" as const, icon: Stamp, title: "Stamps", desc: "Digital stamp cards. Buy X, get 1 free." },
  { key: "visitRewards" as const, icon: MapPin, title: "Visit Rewards", desc: "Reward customers for visiting a set number of times." },
  { key: "spendRewards" as const, icon: Banknote, title: "Spend Rewards", desc: "Reward customers after reaching spending targets." },
  { key: "referralRewards" as const, icon: Users, title: "Referral Rewards", desc: "Reward customers for referring friends." },
  { key: "birthdayRewards" as const, icon: Cake, title: "Birthday Rewards", desc: "Automatic rewards during birthday month." },
  { key: "anniversaryRewards" as const, icon: Trophy, title: "Anniversary Rewards", desc: "Reward customers on membership anniversaries." },
];

function EngineCard({ def, config, onToggle, onFieldChange }: {
  def: typeof ENGINE_DEFINITIONS[0];
  config: RewardEngineConfig;
  onToggle: (enabled: boolean) => void;
  onFieldChange: (field: string, value: string | number) => void;
}) {
  const engine = config[def.key];
  const Icon = def.icon;

  return (
    <motion.div layout>
      <Card className={`border transition-all ${engine.enabled ? "border-orange-300 bg-orange-50/30 shadow-sm" : "border-gray-200 bg-white"}`}>
        <div className="p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${engine.enabled ? "bg-orange-100" : "bg-gray-100"}`}>
            <Icon className={`w-5 h-5 ${engine.enabled ? "text-orange-600" : "text-gray-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">{def.title}</h3>
            <p className="text-xs text-gray-500">{def.desc}</p>
          </div>
          <Switch checked={engine.enabled} onCheckedChange={onToggle} />
        </div>

        {engine.enabled && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }} className="px-4 pb-4">
            <div className="border-t border-orange-100 pt-4 space-y-3">
              {def.key === "points" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Spend Amount (£)</Label>
                    <Input type="number" min={1} value={config.points.spendAmount} onChange={(e) => onFieldChange("spendAmount", Number(e.target.value))} className="text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Points Awarded</Label>
                    <Input type="number" min={1} value={config.points.pointsAwarded} onChange={(e) => onFieldChange("pointsAwarded", Number(e.target.value))} className="text-sm mt-1" />
                  </div>
                </div>
              )}
              {def.key === "stamps" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Purchases Required</Label>
                    <Input type="number" min={1} value={config.stamps.purchasesRequired} onChange={(e) => onFieldChange("purchasesRequired", Number(e.target.value))} className="text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Reward Earned</Label>
                    <Input value={config.stamps.rewardEarned} onChange={(e) => onFieldChange("rewardEarned", e.target.value)} className="text-sm mt-1" />
                  </div>
                </div>
              )}
              {def.key === "visitRewards" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Visits Required</Label>
                    <Input type="number" min={1} value={config.visitRewards.visitsRequired} onChange={(e) => onFieldChange("visitsRequired", Number(e.target.value))} className="text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Reward</Label>
                    <Input value={config.visitRewards.rewardValue} onChange={(e) => onFieldChange("rewardValue", e.target.value)} className="text-sm mt-1" />
                  </div>
                </div>
              )}
              {def.key === "spendRewards" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Spend Target (£)</Label>
                    <Input value={config.spendRewards.spendTarget} onChange={(e) => onFieldChange("spendTarget", e.target.value)} className="text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Reward (£)</Label>
                    <Input value={config.spendRewards.rewardValue} onChange={(e) => onFieldChange("rewardValue", e.target.value)} className="text-sm mt-1" />
                  </div>
                </div>
              )}
              {def.key === "referralRewards" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Referrer Reward</Label>
                    <Input value={config.referralRewards.referralReward} onChange={(e) => onFieldChange("referralReward", e.target.value)} className="text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Friend Reward</Label>
                    <Input value={config.referralRewards.friendReward} onChange={(e) => onFieldChange("friendReward", e.target.value)} className="text-sm mt-1" />
                  </div>
                </div>
              )}
              {def.key === "birthdayRewards" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Reward Type</Label>
                    <Input value={config.birthdayRewards.rewardType} onChange={(e) => onFieldChange("rewardType", e.target.value)} className="text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Expiry Period</Label>
                    <Input value={config.birthdayRewards.expiryPeriod} onChange={(e) => onFieldChange("expiryPeriod", e.target.value)} className="text-sm mt-1" />
                  </div>
                </div>
              )}
              {def.key === "anniversaryRewards" && (
                <div>
                  <Label className="text-xs text-gray-500">Reward Type</Label>
                  <Input value={config.anniversaryRewards.rewardType} onChange={(e) => onFieldChange("rewardType", e.target.value)} className="text-sm mt-1" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

export default function RewardTypesScreen({ initialConfig, onComplete, onBack }: RewardTypesScreenProps) {
  const [config, setConfig] = useState<RewardEngineConfig>(() => {
    if (initialConfig) return initialConfig;
    return {
      points: { enabled: true, spendAmount: 1, pointsAwarded: 10 },
      stamps: { enabled: false, purchasesRequired: 10, rewardEarned: "Free item" },
      visitRewards: { enabled: false, visitsRequired: 5, rewardValue: "10% off" },
      spendRewards: { enabled: false, spendTarget: "100", rewardValue: "10" },
      referralRewards: { enabled: true, referralReward: "500 points", friendReward: "10% off first visit" },
      birthdayRewards: { enabled: true, rewardType: "Free item", expiryPeriod: "30 days" },
      anniversaryRewards: { enabled: false, rewardType: "10% off" },
    };
  });

  const enabledCount = Object.values(config).filter((v) => v.enabled).length;

  const handleToggle = (key: string, enabled: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: { ...prev[key as keyof RewardEngineConfig], enabled } }));
  };

  const handleFieldChange = (key: string, field: string, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key as keyof RewardEngineConfig], [field]: value },
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
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Select Reward Types</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Choose which reward systems to activate. You can customise each one after enabling.</p>
          </div>

          <div className="space-y-3 mb-8">
            {ENGINE_DEFINITIONS.map((def) => (
              <EngineCard
                key={def.key}
                def={def}
                config={config}
                onToggle={(enabled) => handleToggle(def.key, enabled)}
                onFieldChange={(field, value) => handleFieldChange(def.key, field, value)}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-400">{enabledCount} reward type{enabledCount !== 1 ? "s" : ""} enabled</p>
            <Button size="lg" disabled={enabledCount === 0} onClick={() => onComplete(config)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed">
              Continue<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
