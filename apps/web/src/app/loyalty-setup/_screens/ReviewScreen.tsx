"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, User, Package, Zap, Star, Trophy, PartyPopper, Edit3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { SectorTemplate, RewardCustomization, RewardEngineConfig, TierConfig } from "@/services/loyalty-setup/types";

interface ReviewScreenProps {
  template: SectorTemplate;
  customizations: Record<string, RewardCustomization>;
  engines: RewardEngineConfig | null;
  tierConfig: TierConfig | null;
  onSave: (descriptions: Record<string, string>) => void;
  onBack: () => void;
  onJumpTo: (step: string) => void;
  isSaving: boolean;
}

export default function ReviewScreen({ template, customizations, engines, tierConfig, onSave, onBack, onJumpTo, isSaving }: ReviewScreenProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const c of template.campaigns) init[c.key] = c.description;
    return init;
  });

  const enabledEngineNames = engines
    ? Object.entries(engines)
        .filter(([, v]) => v.enabled)
        .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Review & Activate</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Everything is set. Review your programme below and activate when ready.</p>
          </div>

          <div className="space-y-3 mb-8">
            {/* Profile */}
            <SectionCard
              icon={User} title="Business Profile" onEdit={() => onJumpTo("profile")}
              items={[template.sectorKey ? `Sector: ${template.sectorKey}` : ""]}
            />

            {/* Template */}
            <SectionCard
              icon={Package} title="Template" onEdit={() => onJumpTo("templates")}
              items={[template.name, template.description]}
            />

            {/* Enabled Engines */}
            <SectionCard
              icon={Zap} title="Enabled Rewards" onEdit={() => onJumpTo("reward-types")}
              items={enabledEngineNames.length > 0 ? enabledEngineNames : ["No rewards enabled"]}
            />

            {/* Tiers */}
            {tierConfig?.enabled && (
              <SectionCard
                icon={Trophy} title="Customer Tiers" onEdit={() => onJumpTo("tiers")}
                items={tierConfig.tiers.map((t) => `${t.name}: ${t.requirementValue} ${t.requirementType}`)}
              />
            )}

            {/* Campaigns */}
            <Card className="p-5 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><PartyPopper className="w-4 h-4 text-orange-600" /></div>
                  <h3 className="font-semibold text-gray-900">Campaigns</h3>
                </div>
              </div>
              <div className="space-y-3">
                {template.campaigns.map((camp) => (
                  <div key={camp.id} className="border border-orange-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">{camp.name}</p>
                    <Textarea value={descriptions[camp.key] || ""} onChange={(e) => setDescriptions((p) => ({ ...p, [camp.key]: e.target.value }))} rows={2} className="text-sm resize-none mb-2" />
                    <div className="flex flex-wrap gap-1">
                      {camp.includedRewardKeys.map((rk) => {
                        const rew = template.rewards.find((r) => r.key === rk);
                        return rew ? (
                          <span key={rk} className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                            {rew.image}<span>{rew.name}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button size="lg" disabled={isSaving} onClick={() => onSave(descriptions)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]">
              {isSaving ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Activating...</> : <><CheckCircle className="mr-2 w-5 h-5" />Activate Programme</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, items, onEdit }: { icon: React.ElementType; title: string; items: string[]; onEdit: () => void }) {
  return (
    <Card className="p-4 border border-orange-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Icon className="w-4 h-4 text-orange-600" /></div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        </div>
        <button onClick={onEdit} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors">
          <Edit3 className="w-3 h-3" />Edit
        </button>
      </div>
      <div className="mt-2 ml-11 space-y-0.5">
        {items.filter(Boolean).map((item, i) => (
          <p key={i} className="text-xs text-gray-500">{item}</p>
        ))}
      </div>
    </Card>
  );
}
