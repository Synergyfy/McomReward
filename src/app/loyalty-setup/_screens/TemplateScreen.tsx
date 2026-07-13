"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Package, Coffee, ShoppingBag, Scissors, Briefcase, Gift, Dumbbell, Sparkles, Star, Zap, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateRewardWizardModal from "@/components/dashboard/rewards/CreateRewardWizardModal";
import TemplateCustomizeModal from "./TemplateCustomizeModal";
import type { SectorTemplate, TemplateReward } from "@/services/loyalty-setup/types";
import type { Reward } from "@/services/business-reward/types";

const SECTOR_ICONS: Record<string, React.ElementType> = {
  restaurant: Coffee, cafe: Coffee, retail: ShoppingBag, salon: Scissors, gym: Dumbbell, service: Briefcase, custom: Sparkles,
};

function getRewardCategory(r: TemplateReward): "point" | "stamp" | "hybrid" {
  if (r.pointsRequired > 0 && (r.stampsRequired || 0) > 0) return "hybrid";
  if ((r.stampsRequired || 0) > 0) return "stamp";
  return "point";
}

function templateRewardToReward(tr: TemplateReward): Reward {
  return {
    id: tr.id,
    title: tr.name,
    description: tr.description,
    pointsRequired: tr.pointsRequired,
    stampsRequired: tr.stampsRequired || 0,
    rewardType: tr.rewardType,
    image: tr.image,
    maxPoints: 0,
    value: 0,
    quantity: 0,
    disabled: false,
    is_points_enabled: tr.pointsRequired > 0,
    is_stamps_enabled: (tr.stampsRequired || 0) > 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface TemplateCardProps {
  template: SectorTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCustomize: (template: SectorTemplate) => void;
  sectorKey: string;
}

function TemplateCard({ template, isSelected, onSelect, onCustomize, sectorKey }: TemplateCardProps) {
  const SectorIcon = SECTOR_ICONS[sectorKey] || Gift;
  const rewardTypes = (() => {
    const types = new Set(template.rewards.map((r) => getRewardCategory(r)));
    return { points: types.has("point"), stamps: types.has("stamp"), hybrid: types.has("hybrid") };
  })();

  return (
    <Card className={`group relative flex flex-col hover:shadow-xl transition-all duration-300 border-2 ${
      isSelected ? "border-orange-500 bg-orange-50/60 shadow-md shadow-orange-100" : "border-gray-200 bg-white hover:border-orange-300"
    }`}>
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${isSelected ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gray-200"}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3 cursor-pointer" onClick={() => onSelect(template.id)}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSelected ? "bg-orange-100" : "bg-gray-50"
          }`}>
            <SectorIcon className={`w-7 h-7 ${isSelected ? "text-orange-600" : "text-gray-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              {isSelected && <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{template.description}</p>
          </div>
        </div>

        {/* Included Reward Types */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {rewardTypes.points && (
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
              <Star className="w-3 h-3 mr-1" />Point Rewards
            </Badge>
          )}
          {rewardTypes.stamps && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
              <Zap className="w-3 h-3 mr-1" />Stamp Rewards
            </Badge>
          )}
          {rewardTypes.hybrid && (
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
              <Filter className="w-3 h-3 mr-1" />Hybrid Rewards
            </Badge>
          )}
        </div>

        {/* Benefits */}
        <div className="cursor-pointer" onClick={() => onSelect(template.id)}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Benefits</p>
          <ul className="space-y-1">
            {template.rewards.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 flex-shrink-0">{r.image || "•"}</span>
                <span>{r.name}: {r.description}</span>
              </li>
            ))}
            {template.rewards.length > 5 && (
              <li className="text-sm text-gray-400 pl-6">+{template.rewards.length - 5} more</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}

interface TemplateScreenProps {
  sectorKey: string;
  templates: SectorTemplate[];
  onSelect: (id: string) => void;
  onBack: () => void;
  onTemplatesChange?: (templates: SectorTemplate[]) => void;
}

export default function TemplateScreen({ sectorKey, templates, onSelect, onBack, onTemplatesChange }: TemplateScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState<SectorTemplate[]>(templates);
  const [customizingTemplate, setCustomizingTemplate] = useState<SectorTemplate | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [editingRewardFromCustomize, setEditingRewardFromCustomize] = useState<TemplateReward | null>(null);
  const [isRewardWizardOpen, setIsRewardWizardOpen] = useState(false);

  const displayName = sectorKey === "restaurant" ? "Restaurant & Hospitality" : sectorKey === "cafe" ? "Café & Coffee Shop" : sectorKey === "retail" ? "Retail Business" : sectorKey === "salon" ? "Salon & Beauty" : sectorKey === "gym" ? "Gym & Fitness" : sectorKey === "service" ? "Service Business" : sectorKey === "custom" ? "Your Business" : "Business";

  const handleCustomize = useCallback((template: SectorTemplate) => {
    setSelectedId(template.id);
    setCustomizingTemplate(template);
    setIsCustomizeOpen(true);
  }, []);

  const handleUseTemplate = useCallback((templateId: string) => {
    setCustomizingTemplate(null);
    setIsCustomizeOpen(false);
    onSelect(templateId);
  }, [onSelect]);

  const handleRewardsChanged = useCallback((updatedTemplate: SectorTemplate) => {
    setLocalTemplates((prev) => {
      const updated = prev.map((tpl) => (tpl.id === updatedTemplate.id ? updatedTemplate : tpl));
      onTemplatesChange?.(updated);
      return updated;
    });
    setCustomizingTemplate(updatedTemplate);
  }, [onTemplatesChange]);

  const handleEditRewardFromCustomize = useCallback((reward: TemplateReward) => {
    setEditingRewardFromCustomize(reward);
    setIsRewardWizardOpen(true);
    setIsCustomizeOpen(false);
  }, []);

  const handleRewardWizardClose = useCallback(() => {
    setIsRewardWizardOpen(false);
    setEditingRewardFromCustomize(null);
    setIsCustomizeOpen(true);
  }, []);

  const handleRewardWizardSave = useCallback((rewardData: Reward) => {
    if (!customizingTemplate || !editingRewardFromCustomize) return;
    const updatedRewards = customizingTemplate.rewards.map((r) => {
      if (r.id !== rewardData.id) return r;
      return {
        ...r,
        name: rewardData.title,
        description: rewardData.description,
        pointsRequired: rewardData.pointsRequired || 0,
        stampsRequired: rewardData.stampsRequired || 0,
        rewardType: rewardData.rewardType || r.rewardType,
        image: rewardData.image || r.image,
      };
    });
    const updatedTemplate = { ...customizingTemplate, rewards: updatedRewards };
    setCustomizingTemplate(updatedTemplate);
    handleRewardsChanged(updatedTemplate);
    handleRewardWizardClose();
  }, [customizingTemplate, editingRewardFromCustomize, handleRewardsChanged, handleRewardWizardClose]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-5"><Package className="w-8 h-8 text-white" /></div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Choose Your Template</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Admin has prepared templates for <span className="font-semibold text-gray-700">{displayName}</span>. Select one to customize.</p>
          </div>
          <div className="grid gap-4 mb-8">
            {localTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={selectedId === tpl.id}
                onSelect={setSelectedId}
                onCustomize={handleCustomize}
                sectorKey={sectorKey}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              disabled={!selectedId}
              onClick={() => {
                const tpl = localTemplates.find((t) => t.id === selectedId);
                if (tpl) handleCustomize(tpl);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Customize<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Customize Modal */}
      {customizingTemplate && (
        <TemplateCustomizeModal
          isOpen={isCustomizeOpen}
          onClose={() => { setIsCustomizeOpen(false); setCustomizingTemplate(null); }}
          template={customizingTemplate}
          onUseTemplate={handleUseTemplate}
          onRewardsChanged={handleRewardsChanged}
          onEditReward={handleEditRewardFromCustomize}
        />
      )}

      {/* Reward Wizard Modal (rendered outside customize modal so it fully takes over) */}
      {editingRewardFromCustomize && (
        <CreateRewardWizardModal
          isOpen={isRewardWizardOpen}
          onClose={handleRewardWizardClose}
          reward={templateRewardToReward(editingRewardFromCustomize)}
          onSave={handleRewardWizardSave}
          enabledModes={
            editingRewardFromCustomize
              ? [
                  ...(editingRewardFromCustomize.pointsRequired > 0 ? ["point" as const] : []),
                  ...((editingRewardFromCustomize.stampsRequired || 0) > 0 ? ["stamp" as const] : []),
                  ...(editingRewardFromCustomize.pointsRequired === 0 && (editingRewardFromCustomize.stampsRequired || 0) === 0
                    ? ["point" as const]
                    : []),
                ]
              : ["point"]
          }
        />
      )}
    </div>
  );
}
