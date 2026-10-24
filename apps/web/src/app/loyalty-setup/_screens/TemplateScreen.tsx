"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, CheckCircle, Coffee, ShoppingBag, Scissors, Briefcase, Gift, Dumbbell, Sparkles, Layers3, Megaphone, Eye, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SectorTemplate, TemplateReward } from "@/services/loyalty-setup/types";
import { areRewardDetailsAdminManaged } from "@/services/loyalty-setup/template-edit-policy";

const REWARD_TYPES = ["Voucher", "gift card", "coupon", "point offer", "physical product", "MallDiscount"] as const;

const SECTOR_ICONS: Record<string, React.ElementType> = {
  restaurant: Coffee, cafe: Coffee, retail: ShoppingBag, salon: Scissors, gym: Dumbbell, service: Briefcase, custom: Sparkles,
};

const SETUP_STEPS = ["Profile", "Rewards", "Campaigns", "Tiers", "Review"];

function getRewardCategory(reward: TemplateReward): "point" | "stamp" | "hybrid" {
  if (reward.pointsRequired > 0 && (reward.stampsRequired || 0) > 0) return "hybrid";
  if ((reward.stampsRequired || 0) > 0) return "stamp";
  return "point";
}

interface TemplateCardProps {
  template: SectorTemplate;
  isSelected: boolean;
  hasCustomized: boolean;
  onSelectTemplate: (template: SectorTemplate) => void;
  onViewDetails: (template: SectorTemplate) => void;
}

function TemplateCard({ template, isSelected, hasCustomized, onSelectTemplate, onViewDetails }: TemplateCardProps) {
  const SectorIcon = SECTOR_ICONS[template.sectorKey.toLowerCase()] || Gift;
  const rewards = template.rewards || [];
  const campaigns = template.campaigns || [];

  return (
    <Card className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-0 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? "border-orange-500 ring-2 ring-orange-100" : "border-slate-200 hover:border-orange-300"}`}>
      <div className={`h-1.5 w-full ${isSelected ? "bg-orange-500" : "bg-slate-100"}`} />
      <button type="button" onClick={() => onSelectTemplate(template)} aria-pressed={isSelected} className="flex flex-1 cursor-pointer flex-col p-5 text-left sm:p-6">
        <div className="flex w-full items-start gap-4">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-600"}`}><SectorIcon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 min-w-0 text-sm font-bold leading-5 text-slate-900 sm:text-lg">{template.name}</span>
              {isSelected && <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />}
            </span>
            <span className="mt-2 inline-flex max-w-full rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold leading-4 text-slate-700 sm:text-[11px]">{displaySectorName(template.sectorKey)}</span>
          </span>
        </div>

        <span className="mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{template.description}</span>

        <span className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700"><Gift className="h-4 w-4 text-orange-500" /><strong>{rewards.length}</strong> rewards</span>
          <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700"><Megaphone className="h-4 w-4 text-blue-600" /><strong>{campaigns.length}</strong> campaigns</span>
        </span>

      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
        <span className={`text-[11px] font-semibold sm:text-xs ${isSelected ? "text-orange-700" : "text-slate-500"}`}>{hasCustomized ? "Rewards customized" : isSelected ? "Selected" : "Select"}</span>
        <button type="button" onClick={() => onViewDetails(template)} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 ring-1 sm:text-xs ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><Eye className="h-3.5 w-3.5" />View card</button>
      </div>
    </Card>
  );
}

function displaySectorName(sectorKey: string) {
  const labels: Record<string, string> = {
    restaurant: "Restaurant & Hospitality", cafe: "Café & Coffee Shop", retail: "Retail Business",
    salon: "Salon & Beauty", gym: "Gym & Fitness", service: "Service Business", custom: "Your Business",
  };
  return labels[sectorKey.toLowerCase()] || sectorKey;
}

interface TemplateScreenProps {
  sectorKey: string;
  templates: SectorTemplate[];
  initialSelectedId?: string | null;
  initialCustomizedIds?: string[];
  onSelect: (id: string) => void;
  onBack: () => void;
  onTemplateSave?: (template: SectorTemplate) => void;
}

export default function TemplateScreen({ sectorKey, templates, initialSelectedId, initialCustomizedIds = [], onSelect, onBack, onTemplateSave }: TemplateScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [localTemplates, setLocalTemplates] = useState<SectorTemplate[]>(templates);
  const [customizedIds, setCustomizedIds] = useState<Set<string>>(() => new Set(initialCustomizedIds));
  const [detailTemplate, setDetailTemplate] = useState<SectorTemplate | null>(null);

  const displayName = displaySectorName(sectorKey);

  const handleSaveTemplate = useCallback((updatedTemplate: SectorTemplate) => {
    setLocalTemplates((prev) => {
      const updated = prev.map((tpl) => (tpl.id === updatedTemplate.id ? updatedTemplate : tpl));
      return updated;
    });
    onTemplateSave?.(updatedTemplate);
    setCustomizedIds((prev) => new Set(prev).add(updatedTemplate.id));
  }, [onTemplateSave]);

  const hasCustomized = selectedId ? customizedIds.has(selectedId) : false;

  if (detailTemplate) {
    return <TemplateDetailScreen
      key={detailTemplate.id}
      template={localTemplates.find((item) => item.id === detailTemplate.id) || detailTemplate}
      onBack={() => setDetailTemplate(null)}
      onSelect={() => { setSelectedId(detailTemplate.id); setDetailTemplate(null); }}
      onSave={handleSaveTemplate}
    />;
  }

  return (
    <div className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-[1.5vw] py-6 sm:px-[1.5vw] sm:py-9 md:px-7 lg:px-10 lg:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <button onClick={onBack} className="mb-7 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-500 sm:text-sm transition hover:bg-white hover:text-orange-700">
            <ArrowLeft className="h-4 w-4" />Back
          </button>
          <div aria-label="Setup progress, step 2 of 5" className="mb-8 w-full">
            <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-sm">
              <span>Step 2 of 5 · Rewards</span><span className="text-orange-600">40% complete</span>
            </div>
            <div className="relative grid grid-cols-5">
              <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[18px] h-0.5 bg-slate-200">
                <div className="h-full w-1/4 bg-orange-500" />
              </div>
              {SETUP_STEPS.map((label, index) => {
                const number = index + 1;
                const isComplete = number < 2;
                const isCurrent = number === 2;
                return (
                  <div key={label} aria-current={isCurrent ? "step" : undefined} className={`relative z-10 flex min-w-0 flex-col items-center gap-2 ${isCurrent ? "text-orange-700" : isComplete ? "text-slate-700" : "text-slate-400"}`}>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold sm:h-9 sm:w-9 sm:text-base ${isComplete ? "border-orange-500 bg-orange-500 text-white" : isCurrent ? "border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-100" : "border-slate-300 bg-white text-slate-500"}`}>{isComplete ? <Check className="h-4 w-4" /> : number}</span>
                    <span className="max-w-full truncate text-[10px] font-semibold sm:text-[11px]">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
            <div className="max-w-3xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs text-orange-600">MCOM Rewards setup · {displayName}</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Choose your rewards template</h1>
              <p className="mt-3 max-w-2xl text-[13px] leading-5 text-slate-600 sm:text-base sm:leading-6">Start with a programme prepared for your business. You can review and customise its rewards before continuing.</p>
            </div>
            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm sm:text-sm">
              <Layers3 className="h-4 w-4 text-orange-600" />{localTemplates.length} {localTemplates.length === 1 ? "template" : "templates"}
            </div>
          </div>
          <div className="mb-8 grid w-full grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {localTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={selectedId === tpl.id}
                hasCustomized={customizedIds.has(tpl.id)}
                onSelectTemplate={(template) => setSelectedId(template.id)}
                onViewDetails={setDetailTemplate}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 border-t border-slate-200 pt-7 sm:pt-8">
            <Button
              size="lg"
              disabled={!selectedId}
              onClick={() => {
                if (selectedId) onSelect(selectedId);
              }}
              className="h-12 min-w-[240px] rounded-xl bg-orange-600 px-8 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,91,0,0.2)] sm:text-lg transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:min-w-[280px] sm:text-lg"
            >
              Continue<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {selectedId && !hasCustomized && (
              <p className="text-center text-[10px] text-slate-500 sm:text-sm">You can continue with this template or choose <strong>View card</strong> to review and edit its rewards.</p>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

function TemplateDetailScreen({ template, onBack, onSelect, onSave }: { template: SectorTemplate; onBack: () => void; onSelect: () => void; onSave: (template: SectorTemplate) => void }) {
  const [draft, setDraft] = useState<SectorTemplate>(template);
  const [editingReward, setEditingReward] = useState<TemplateReward | null>(null);
  const [rewardEditStep, setRewardEditStep] = useState<1 | 2>(1);
  const rewards = draft.rewards || [];
  const campaigns = draft.campaigns || [];
  const SectorIcon = SECTOR_ICONS[draft.sectorKey.toLowerCase()] || Gift;
  const rewardDetailsAdminManaged = areRewardDetailsAdminManaged(draft.sectorKey, draft.isBuiltIn);
  const openRewardEditor = (reward: TemplateReward) => {
    setEditingReward(reward);
    setRewardEditStep(1);
  };
  const closeRewardEditor = () => setEditingReward(null);
  const saveEditingReward = (updatedReward: TemplateReward) => {
    const updated = {
      ...draft,
      rewards: (draft.rewards || []).map((reward) => reward.id === updatedReward.id ? updatedReward : reward),
    };
    setDraft(updated);
    onSave(updated);
    setEditingReward(null);
  };
  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto w-full max-w-[1360px] px-[1.5vw] py-3 sm:px-[1.5vw] sm:py-8 md:px-7 lg:px-10">
        <button onClick={onBack} className="mx-4 mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-slate-600 sm:text-sm transition hover:bg-white hover:text-orange-700 sm:mx-0 sm:mb-5">
          <ArrowLeft className="h-4 w-4" />Back to templates
        </button>

        <header className="relative mb-5 overflow-hidden border-y border-slate-200 bg-white sm:mb-8 sm:rounded-3xl sm:border sm:shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-200" />
          <div className="p-5 pt-6 sm:p-8 sm:pt-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 sm:h-14 sm:w-14">
                  <SectorIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-orange-100 bg-orange-50 text-orange-700">Template overview</Badge>
                    {draft.isBuiltIn && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Admin provided</Badge>}
                  </div>
                  <h1 className="mt-3 text-lg font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">{draft.name}</h1>
                  <p className="mt-2 text-[13px] font-medium text-slate-500 sm:text-sm">{displaySectorName(draft.sectorKey)}</p>
                  <p className="mt-4 max-w-3xl text-[13px] leading-5 text-slate-600 sm:text-base sm:leading-6">{draft.description || "No overview has been provided for this template."}</p>
                </div>
              </div>

              <Button onClick={onSelect} className="min-h-11 shrink-0 bg-orange-600 text-[12px] text-white sm:text-sm shadow-sm shadow-orange-200 hover:bg-orange-700 lg:mt-1">Use this template<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>

            <div className="mt-7 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <DetailStat label="Included rewards" value={rewards.length} />
              <DetailStat label="Campaign ideas" value={campaigns.length} />
              <DetailStat label="Reward structure" value={[...new Set(rewards.map(getRewardCategory))].map((kind) => `${kind[0].toUpperCase()}${kind.slice(1)}`).join(" · ") || "Not specified"} />
            </div>
          </div>
        </header>

        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] lg:gap-7">
          <div className="w-full bg-white py-5 sm:rounded-3xl sm:border sm:border-slate-200 sm:p-7 sm:shadow-sm">
            <div className="mb-5 flex w-full flex-wrap items-end justify-between gap-3 px-4 sm:px-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600 sm:text-xs">What customers can earn</p>
                <h2 className="mt-1 text-base font-bold text-slate-950 sm:text-2xl">Included rewards</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs">{rewards.length} {rewards.length === 1 ? "reward" : "rewards"}</span>
            </div>

            {rewards.length ? (
              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <article key={reward.id} className="w-full border-b border-slate-200 bg-white px-4 py-4 last:border-b-0 sm:rounded-2xl sm:border sm:p-4 sm:transition sm:hover:border-orange-200 sm:hover:shadow-sm lg:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl ring-1 ring-orange-100">{reward.image || "🎁"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13px] font-semibold text-slate-950 sm:text-base">{reward.name}</h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600 sm:text-[11px]">{reward.rewardType || "Reward"}</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-5 text-slate-600 sm:text-sm">{reward.description || "No description provided."}</p>
                      </div>
                      <span className="hidden h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[10px] font-semibold text-slate-500 sm:flex sm:text-xs">{String(index + 1).padStart(2, "0")}</span>
                      <Button variant="outline" size="sm" onClick={() => openRewardEditor(reward)} className="min-h-9 shrink-0 px-3 text-[11px] sm:text-sm"><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {reward.pointsRequired > 0 && <span className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-medium text-blue-800 sm:text-xs">{reward.pointsRequired} points required</span>}
                      {(reward.stampsRequired || 0) > 0 && <span className="rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-medium text-orange-800 sm:text-xs">{reward.stampsRequired} stamps required</span>}
                      {reward.pointsRequired <= 0 && !(reward.stampsRequired || 0) && <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600 sm:text-xs">No redemption threshold specified</span>}
                    </div>
                  </article>
                ))}
              </div>
            ) : <p className="mx-4 rounded-2xl bg-slate-50 p-5 text-[13px] text-slate-600 sm:text-sm sm:mx-0">No rewards are configured in this template.</p>}
          </div>

          <aside className="space-y-5">
            <section className="bg-white px-4 py-5 sm:rounded-3xl sm:border sm:border-slate-200 sm:p-6 sm:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Layers3 className="h-5 w-5" /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">Benefits</p><h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg">Built for {displaySectorName(draft.sectorKey)}</h2></div>
              </div>
              {draft.benefits?.length ? <ul className="mt-5 space-y-3">{draft.benefits.map((benefit, index) => <li key={index} className="flex gap-2.5 text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{benefit}</li>)}</ul> : <p className="mt-4 text-[13px] leading-5 text-slate-500 sm:text-sm sm:leading-6">No programme benefits were supplied.</p>}
            </section>

            <section className="bg-white px-4 py-5 sm:rounded-3xl sm:border sm:border-slate-200 sm:p-6 sm:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Megaphone className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">Campaign ideas</p><h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg">Ready to activate</h2></div></div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:text-xs">{campaigns.length}</span>
              </div>
              {campaigns.length ? <div className="mt-4 space-y-3">{campaigns.map((campaign) => <article key={campaign.key} className="rounded-xl bg-[#f7f8ff] p-4"><h3 className="text-[13px] font-semibold text-slate-900 sm:text-sm">{campaign.name}</h3><p className="mt-1 text-[12px] leading-5 text-slate-600 sm:text-sm">{campaign.description || "No campaign description provided."}</p></article>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-[12px] leading-5 text-slate-600 sm:text-sm">No campaigns are configured for this template.</p>}
            </section>
          </aside>
        </section>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 px-4 pt-5 sm:flex-row sm:justify-between sm:px-0">
          <Button variant="outline" onClick={onBack} className="min-h-11 text-[12px] sm:text-sm">Back to templates</Button>
          <Button onClick={onSelect} className="min-h-11 bg-orange-600 px-6 text-[12px] text-white sm:text-sm shadow-sm shadow-orange-200 hover:bg-orange-700">Use this template<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
      <Dialog open={Boolean(editingReward)} onOpenChange={(open) => { if (!open) setEditingReward(null); }}>
        {editingReward && <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left sm:px-7 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600 sm:text-xs">Reward editor</p>
                <DialogTitle className="mt-1 truncate text-lg font-bold text-slate-950 sm:text-2xl">{editingReward.name}</DialogTitle>
              </div>
              <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-orange-700 sm:text-xs">Step {rewardEditStep} of 2</span>
            </div>
            <DialogDescription className="text-[12px] text-slate-600 sm:text-sm">Update this reward in two short steps.</DialogDescription>
          </DialogHeader>

          <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
            <div role="progressbar" aria-label="Reward edit progress" aria-valuemin={1} aria-valuemax={2} aria-valuenow={rewardEditStep} className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full bg-orange-500 transition-all duration-300 ${rewardEditStep === 1 ? "w-1/2" : "w-full"}`} />
            </div>
            <div className="relative mt-3 grid grid-cols-2 text-center text-[11px] font-semibold sm:text-xs">
              <span className={`flex items-center justify-center gap-2 ${rewardEditStep === 1 ? "text-orange-700" : "text-slate-500"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${rewardEditStep === 1 ? "border-orange-500 bg-orange-50 text-orange-700" : "border-emerald-500 bg-emerald-500 text-white"}`}>{rewardEditStep === 1 ? "1" : <Check className="h-3.5 w-3.5" />}</span>Basic Information</span>
              <span className={`flex items-center justify-center gap-2 ${rewardEditStep === 2 ? "text-orange-700" : "text-slate-400"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${rewardEditStep === 2 ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-400"}`}>2</span>Reward Requirements</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <div className="mx-auto max-w-md">
              <div className="mb-6 text-center">
                <h2 className="text-base font-bold text-slate-950 sm:text-xl">{rewardEditStep === 1 ? "Basic Information" : "Reward Requirements"}</h2>
                <p className="mt-1 text-[12px] leading-5 text-slate-500 sm:text-sm">{rewardEditStep === 1 ? "Set the reward details customers will see." : "Set the points and stamps needed to redeem this reward."}</p>
              </div>

              {rewardEditStep === 1 ? (
                <div className="space-y-4">
                  {rewardDetailsAdminManaged && <p className="rounded-xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-[12px] leading-5 text-orange-900 sm:text-sm">Reward name, type, and description are managed by an administrator. You can still change the requirements in the next step.</p>}
                  <label className="block text-[12px] font-semibold text-slate-700 sm:text-sm">Reward name{rewardDetailsAdminManaged && <span className="ml-1 text-[10px] font-normal text-slate-400 sm:text-xs">· Admin managed</span>}
                    <input disabled={rewardDetailsAdminManaged} value={editingReward.name} onChange={(event) => setEditingReward((current) => current ? { ...current, name: event.target.value } : current)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-normal text-slate-900 sm:text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" />
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-700 sm:text-sm">Reward type{rewardDetailsAdminManaged && <span className="ml-1 text-[10px] font-normal text-slate-400 sm:text-xs">· Admin managed</span>}
                    <Select disabled={rewardDetailsAdminManaged} value={editingReward.rewardType || undefined} onValueChange={(value) => setEditingReward((current) => current ? { ...current, rewardType: value } : current)}>
                      <SelectTrigger className="mt-1.5 h-11 rounded-xl bg-white text-[12px] font-normal sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"><SelectValue placeholder="Choose a reward type" /></SelectTrigger>
                      <SelectContent>
                        {editingReward.rewardType && !REWARD_TYPES.includes(editingReward.rewardType as (typeof REWARD_TYPES)[number]) && <SelectItem value={editingReward.rewardType}>{editingReward.rewardType}</SelectItem>}
                        {REWARD_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-700 sm:text-sm">Description{rewardDetailsAdminManaged && <span className="ml-1 text-[10px] font-normal text-slate-400 sm:text-xs">· Admin managed</span>}
                    <textarea disabled={rewardDetailsAdminManaged} value={editingReward.description || ""} onChange={(event) => setEditingReward((current) => current ? { ...current, description: event.target.value } : current)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] font-normal text-slate-900 sm:text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" />
                  </label>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[12px] font-semibold text-slate-700 sm:text-sm">Points required
                    <input type="number" min={0} value={editingReward.pointsRequired || 0} onChange={(event) => setEditingReward((current) => current ? { ...current, pointsRequired: Math.max(0, Number(event.target.value)) } : current)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-900 outline-none sm:text-base transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-700 sm:text-sm">Stamps required
                    <input type="number" min={0} value={editingReward.stampsRequired || 0} onChange={(event) => setEditingReward((current) => current ? { ...current, stampsRequired: Math.max(0, Number(event.target.value)) } : current)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-900 outline-none sm:text-base transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-between sm:px-7">
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeRewardEditor} className="min-h-11 text-[12px] sm:text-sm">Cancel</Button>
              {rewardEditStep === 2 && <Button variant="outline" onClick={() => setRewardEditStep(1)} className="min-h-11 text-[12px] sm:text-sm">Back</Button>}
            </div>
            {rewardEditStep === 1 ? (
              <Button onClick={() => setRewardEditStep(2)} className="min-h-11 bg-orange-600 text-[12px] text-white hover:bg-orange-700 sm:text-sm">Continue<ArrowRight className="ml-2 h-4 w-4" /></Button>
            ) : (
              <Button onClick={() => saveEditingReward(editingReward)} className="min-h-11 bg-orange-600 text-[12px] text-white hover:bg-orange-700 sm:text-sm"><Save className="mr-2 h-4 w-4" />Save reward</Button>
            )}
          </DialogFooter>
        </DialogContent>}
      </Dialog>
    </main>
  );
}

function DetailStat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-[#f7f8ff] p-4"><p className="text-[10px] font-medium text-slate-500 sm:text-xs">{label}</p><p className="mt-1 text-[13px] font-bold capitalize text-slate-900 sm:text-sm">{value}</p></div>; }
