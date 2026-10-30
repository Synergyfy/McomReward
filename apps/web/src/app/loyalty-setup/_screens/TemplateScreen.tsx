"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ArrowDown, Check, Coffee, ShoppingBag, Scissors, Briefcase, Gift, Dumbbell, Sparkles, Layers3, Megaphone, Eye, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SectorTemplate, TemplateReward } from "@/services/loyalty-setup/types";
import { areRewardDetailsAdminManaged } from "@/services/loyalty-setup/template-edit-policy";
import FieldRequirementHint from "@/components/onboarding/FieldRequirementHint";
import { formTypography } from "./formTypography";
import SetupProgress from "./SetupProgress";

const REWARD_TYPES = ["gift card", "coupon", "Voucher", "Deals", "point offer", "physical product", "MallDiscount"] as const;

const SECTOR_ICONS: Record<string, React.ElementType> = {
  restaurant: Coffee, cafe: Coffee, retail: ShoppingBag, salon: Scissors, gym: Dumbbell, service: Briefcase, custom: Sparkles,
};

function getRewardCategory(reward: TemplateReward): "point" | "stamp" | "hybrid" {
  if (reward.pointsRequired > 0 && (reward.stampsRequired || 0) > 0) return "hybrid";
  if ((reward.stampsRequired || 0) > 0) return "stamp";
  return "point";
}

interface TemplateCardProps {
  template: SectorTemplate;
  onViewDetails: (template: SectorTemplate) => void;
}

function TemplateCard({ template, onViewDetails }: TemplateCardProps) {
  const campaigns = template.campaigns || [];
  const isCustomized = (template.rewards || []).some((reward) => reward.isCustomized);
  const SectorIcon = SECTOR_ICONS[template.sectorKey.toLowerCase()] || Gift;

  return (
    <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg max-sm:h-auto">
      <div className="hidden h-1.5 w-full bg-slate-100 sm:block" />
      <button
        type="button"
        onClick={() => onViewDetails(template)}
        aria-label={`View ${template.name} overview`}
        className="flex h-full w-full cursor-pointer flex-col gap-2 p-3 text-left sm:flex-1 sm:gap-0 sm:p-6"
      >
        <span className="flex min-w-0 items-start justify-between gap-2 sm:hidden">
          <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span className="min-w-0 text-sm font-semibold leading-5 text-slate-900">{template.name}</span>
            <span className="inline-flex max-w-full items-center gap-1.5 text-[10px] font-medium leading-4 text-slate-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
              {displaySectorName(template.sectorKey)}
            </span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        </span>
        <span className="flex w-full items-center gap-2 sm:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700"><Gift className="h-3.5 w-3.5 shrink-0 text-orange-500" /><strong>{(template.rewards || []).length}</strong> rewards</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700"><Megaphone className="h-3.5 w-3.5 shrink-0 text-blue-600" /><strong>{campaigns.length}</strong> campaigns</span>
          {isCustomized && <span className="ml-auto shrink-0 text-[9px] font-semibold text-orange-700">Customized</span>}
        </span>
        <span className="hidden w-full items-start gap-4 sm:flex">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><SectorIcon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 min-w-0 text-sm font-bold leading-5 text-slate-900 sm:text-lg">{template.name}</span>
            </span>
            <span className="mt-2 inline-flex max-w-full rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold leading-4 text-slate-700">{displaySectorName(template.sectorKey)}</span>
          </span>
        </span>
        <span className="hidden mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600 sm:block">{template.description}</span>
        <span className="hidden mt-5 w-full grid-cols-2 gap-2 sm:grid">
          <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700"><Gift className="h-4 w-4 shrink-0 text-orange-500" /><strong>{(template.rewards || []).length}</strong> rewards</span>
          <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700"><Megaphone className="h-4 w-4 shrink-0 text-blue-600" /><strong>{campaigns.length}</strong> campaigns</span>
        </span>
      </button>
      <div className="hidden items-center justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex sm:px-6">
        <button type="button" onClick={() => onViewDetails(template)} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700 sm:text-xs"><Eye className="h-3.5 w-3.5" />View card</button>
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
  onSelect: (id: string) => void;
  onBack: () => void;
  onTemplateSave?: (template: SectorTemplate) => void;
}

export default function TemplateScreen({ sectorKey, templates, onSelect, onBack, onTemplateSave }: TemplateScreenProps) {
  const [localTemplates, setLocalTemplates] = useState<SectorTemplate[]>(templates);
  const [detailTemplate, setDetailTemplate] = useState<SectorTemplate | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const displayName = displaySectorName(sectorKey);

  const handleSaveTemplate = useCallback((updatedTemplate: SectorTemplate) => {
    setLocalTemplates((prev) => {
      const updated = prev.map((tpl) => (tpl.id === updatedTemplate.id ? updatedTemplate : tpl));
      return updated;
    });
    onTemplateSave?.(updatedTemplate);
  }, [onTemplateSave]);

  useEffect(() => {
    if (detailTemplate) {
      setShowScrollHint(false);
      return;
    }

    let dismissed = false;
    const updateHint = () => {
      if (dismissed) return;
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const hasMoreBelow = pageHeight > window.innerHeight + 24;
      setShowScrollHint(isMobile && hasMoreBelow);
    };
    const dismissHint = () => {
      dismissed = true;
      setShowScrollHint(false);
    };

    let secondFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(updateHint);
    });
    window.addEventListener("resize", updateHint);
    window.addEventListener("scroll", dismissHint, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      window.removeEventListener("resize", updateHint);
      window.removeEventListener("scroll", dismissHint);
    };
  }, [detailTemplate, localTemplates.length]);

  if (detailTemplate) {
    return <TemplateDetailScreen
      key={detailTemplate.id}
      template={localTemplates.find((item) => item.id === detailTemplate.id) || detailTemplate}
      onBack={() => setDetailTemplate(null)}
      onSelect={() => onSelect(detailTemplate.id)}
      onSave={handleSaveTemplate}
    />;
  }

  return (
    <div className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-[1.5vw] py-2 sm:px-[1.5vw] sm:py-9 md:px-7 lg:px-10 lg:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <button onClick={onBack} className="mb-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-orange-700 sm:mb-7 sm:gap-2 sm:py-2 sm:text-sm">
            <ArrowLeft className="h-4 w-4" />Back
          </button>
          <SetupProgress currentStep={2} className="mb-4 sm:mb-8" />
          <div className="mb-2 flex flex-col gap-2 border-b border-slate-200 pb-2 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:pb-8">
            <div className="max-w-3xl">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-orange-600 sm:mb-3 sm:text-xs">MCOM Rewards setup · {displayName}</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Choose your rewards template</h1>
              <p className="mt-1.5 max-w-2xl text-[11px] leading-4 text-slate-600 sm:mt-3 sm:text-base sm:leading-6">Start with a programme prepared for your business. You can review and customise its rewards before continuing.</p>
            </div>
          </div>
          <div className="mb-6 grid w-full grid-cols-1 items-stretch gap-3 sm:mb-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {localTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onViewDetails={setDetailTemplate}
              />
            ))}
          </div>
        </motion.div>
      </div>
      {showScrollHint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -2, 0] }}
          transition={{ opacity: { duration: 0.2 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
          role="status"
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg sm:hidden"
        >
          Scroll to see more <ArrowDown className="h-3 w-3" aria-hidden="true" />
        </motion.div>
      )}

    </div>
  );
}

function TemplateDetailScreen({ template, onBack, onSelect, onSave }: { template: SectorTemplate; onBack: () => void; onSelect: () => void; onSave: (template: SectorTemplate) => void }) {
  const [draft, setDraft] = useState<SectorTemplate>(template);
  const [editingReward, setEditingReward] = useState<TemplateReward | null>(null);
  const [numericDrafts, setNumericDrafts] = useState({ pointsRequired: "", stampsRequired: "", quantity: "" });
  const [rewardEditStep, setRewardEditStep] = useState<1 | 2 | 3>(1);
  const [showOverviewScrollHint, setShowOverviewScrollHint] = useState(false);
  const rewards = draft.rewards || [];
  const campaigns = draft.campaigns || [];
  const SectorIcon = SECTOR_ICONS[draft.sectorKey.toLowerCase()] || Gift;
  const rewardDetailsAdminManaged = areRewardDetailsAdminManaged(draft.sectorKey, draft.isBuiltIn);
  const openRewardEditor = (reward: TemplateReward) => {
    setNumericDrafts({
      pointsRequired: String(reward.pointsRequired ?? 0),
      stampsRequired: String(reward.stampsRequired ?? 0),
      quantity: String(reward.quantity ?? 0),
    });
    setEditingReward(reward);
    setRewardEditStep(1);
  };
  const closeRewardEditor = () => setEditingReward(null);
  const saveEditingReward = (updatedReward: TemplateReward) => {
    const savedReward = {
      ...updatedReward,
      pointsRequired: Math.max(0, Number(numericDrafts.pointsRequired) || 0),
      stampsRequired: Math.max(0, Number(numericDrafts.stampsRequired) || 0),
      quantity: Math.max(0, Math.floor(Number(numericDrafts.quantity) || 0)),
      isCustomized: true,
    };
    const updated = {
      ...draft,
      rewards: (draft.rewards || []).map((reward) => reward.id === savedReward.id ? savedReward : reward),
    };
    setDraft(updated);
    onSave(updated);
    setEditingReward(null);
  };

  useEffect(() => {
    if (editingReward) {
      setShowOverviewScrollHint(false);
      return;
    }

    let dismissed = false;
    const updateHint = () => {
      if (dismissed) return;
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      setShowOverviewScrollHint(isMobile && pageHeight > window.innerHeight + 24);
    };
    const dismissHint = () => {
      dismissed = true;
      setShowOverviewScrollHint(false);
    };

    let secondFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(updateHint);
    });
    window.addEventListener("resize", updateHint);
    window.addEventListener("scroll", dismissHint, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      window.removeEventListener("resize", updateHint);
      window.removeEventListener("scroll", dismissHint);
    };
  }, [editingReward, draft.rewards?.length, draft.benefits?.length, draft.campaigns?.length]);

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto w-full max-w-[1360px] px-[1.5vw] py-3 sm:px-[1.5vw] sm:py-8 md:px-7 lg:px-10">
        <button onClick={onBack} className="mx-2 mb-1 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-white hover:text-orange-700 sm:mx-0 sm:mb-5 sm:min-h-10 sm:gap-2 sm:py-2 sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Back to templates
        </button>

        <header className="relative mb-4 overflow-hidden border-y border-slate-200 bg-white sm:mb-8 sm:rounded-3xl sm:border sm:shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-200" />
          <div className="p-4 sm:p-8 sm:pt-9">
            <div className="sm:hidden">
              <div className="flex items-start justify-between gap-2">
                <h1 className="min-w-0 text-lg font-bold leading-6 tracking-tight text-slate-950">{draft.name}</h1>
                {draft.isBuiltIn && <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold leading-4 text-emerald-700">Admin provided</span>}
              </div>
              <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{displaySectorName(draft.sectorKey)}</p>
              <p className="mt-2 text-xs leading-4 text-slate-600">{draft.description || "No overview has been provided for this template."}</p>
              <Button onClick={onSelect} className="mt-3 min-h-10 w-full bg-orange-600 text-xs text-white shadow-sm shadow-orange-200 hover:bg-orange-700">Use this template<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>

            <div className="hidden sm:block">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 sm:h-14 sm:w-14"><SectorIcon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">Template overview</span>
                      {draft.isBuiltIn && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Admin provided</span>}
                    </div>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">{draft.name}</h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">{displaySectorName(draft.sectorKey)}</p>
                    <p className="mt-4 max-w-3xl text-base leading-6 text-slate-600">{draft.description || "No overview has been provided for this template."}</p>
                  </div>
                </div>
                <Button onClick={onSelect} className="min-h-11 shrink-0 bg-orange-600 text-sm text-white shadow-sm shadow-orange-200 hover:bg-orange-700 lg:mt-1">Use this template<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                <DetailStat label="Included rewards" value={rewards.length} />
                <DetailStat label="Campaign ideas" value={campaigns.length} />
                <DetailStat label="Reward structure" value={[...new Set(rewards.map(getRewardCategory))].map((kind) => `${kind[0].toUpperCase()}${kind.slice(1)}`).join(" · ") || "Not specified"} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 sm:hidden">
              <DetailStat label="Rewards" value={rewards.length} />
              <DetailStat label="Campaigns" value={campaigns.length} />
              <DetailStat label="Points" value={rewards.reduce((total, reward) => total + Math.max(0, reward.pointsRequired || 0), 0)} />
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
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl ring-1 ring-orange-100 max-sm:h-9 max-sm:w-9 max-sm:text-base">{reward.image || "🎁"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13px] font-semibold text-slate-950 sm:text-base">{reward.name}</h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600 sm:text-[11px] max-sm:rounded-none max-sm:bg-transparent max-sm:px-0 max-sm:py-0 max-sm:text-orange-600">{reward.rewardType || "Reward"}</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-5 text-slate-600 sm:text-sm">{reward.description || "No description provided."}</p>
                      </div>
                      <span className="hidden h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[10px] font-semibold text-slate-500 sm:flex sm:text-xs">{String(index + 1).padStart(2, "0")}</span>
                      <Button variant="outline" size="sm" onClick={() => openRewardEditor(reward)} aria-label={`Edit ${reward.name}`} className="min-h-9 shrink-0 px-3 text-[11px] sm:text-sm max-sm:min-h-8 max-sm:h-8 max-sm:w-8 max-sm:gap-0 max-sm:border-0 max-sm:bg-transparent max-sm:px-1 max-sm:py-1 max-sm:shadow-none"><Pencil className="mr-1.5 h-3.5 w-3.5 max-sm:mr-0 max-sm:h-3 max-sm:w-3" /><span className="max-sm:hidden">Edit</span></Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 max-sm:mt-[9px] max-sm:pt-0">
                      {reward.pointsRequired > 0 && <span className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-medium text-blue-800 sm:text-xs max-sm:rounded-none max-sm:bg-transparent max-sm:px-0 max-sm:py-0 max-sm:text-blue-700">{reward.pointsRequired} points required</span>}
                      {(reward.stampsRequired || 0) > 0 && <span className="rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-medium text-orange-800 sm:text-xs max-sm:rounded-none max-sm:bg-transparent max-sm:px-0 max-sm:py-0 max-sm:text-orange-700">{reward.stampsRequired} stamps required</span>}
                      {reward.pointsRequired <= 0 && !(reward.stampsRequired || 0) && <span className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600 sm:text-xs">No redemption threshold specified</span>}
                    </div>
                    {reward.isCustomized && <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] leading-4 text-slate-500 sm:text-xs"><p>{reward.quantity ? `${reward.quantity} available` : "Unlimited availability"}<span aria-hidden="true"> · </span>{reward.expiryDatetime ? `Expires ${reward.expiryDatetime.slice(0, 10)}` : "No expiry date"}</p><span className="ml-auto text-[9px] font-semibold text-orange-700">Edited</span></div>}
                  </article>
                ))}
              </div>
            ) : <p className="mx-4 rounded-2xl bg-slate-50 p-5 text-[13px] text-slate-600 sm:text-sm sm:mx-0">No rewards are configured in this template.</p>}
          </div>

          <aside className="space-y-5 max-sm:space-y-3">
            <section className="bg-white px-4 py-5 sm:rounded-3xl sm:border sm:border-slate-200 sm:p-6 sm:shadow-sm max-sm:px-3 max-sm:py-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 max-sm:h-8 max-sm:w-8"><Layers3 className="h-5 w-5 max-sm:h-4 max-sm:w-4" /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs max-sm:text-[9px]">Benefits</p><h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg max-sm:mt-0.5 max-sm:text-sm">Built for {displaySectorName(draft.sectorKey)}</h2></div>
              </div>
              {draft.benefits?.length ? <ul className="mt-5 space-y-3 max-sm:mt-3 max-sm:space-y-2">{draft.benefits.map((benefit, index) => <li key={index} className="flex gap-2.5 text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6 max-sm:gap-2 max-sm:text-[11px] max-sm:leading-4"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600 max-sm:mt-0.5 max-sm:h-3 max-sm:w-3" />{benefit}</li>)}</ul> : <p className="mt-4 text-[13px] leading-5 text-slate-500 sm:text-sm sm:leading-6 max-sm:mt-3 max-sm:text-[11px] max-sm:leading-4">No programme benefits were supplied.</p>}
            </section>

            <section className="bg-white px-4 py-5 sm:rounded-3xl sm:border sm:border-slate-200 sm:p-6 sm:shadow-sm max-sm:px-3 max-sm:py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 max-sm:gap-2"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 max-sm:h-8 max-sm:w-8"><Megaphone className="h-5 w-5 max-sm:h-4 max-sm:w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs max-sm:text-[9px]">Campaign ideas</p><h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg max-sm:mt-0.5 max-sm:text-sm">Ready to activate</h2></div></div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:text-xs max-sm:px-2 max-sm:py-0.5 max-sm:text-[9px]">{campaigns.length}</span>
              </div>
              {campaigns.length ? <div className="mt-4 space-y-3 max-sm:mt-3 max-sm:space-y-2">{campaigns.map((campaign) => <article key={campaign.key} className="rounded-xl bg-[#f7f8ff] p-4 max-sm:p-3"><h3 className="text-[13px] font-semibold text-slate-900 sm:text-sm max-sm:text-[11px]">{campaign.name}</h3><p className="mt-1 text-[12px] leading-5 text-slate-600 sm:text-sm max-sm:mt-0.5 max-sm:text-[10px] max-sm:leading-4">{campaign.description || "No campaign description provided."}</p></article>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-[12px] leading-5 text-slate-600 sm:text-sm max-sm:mt-3 max-sm:p-3 max-sm:text-[10px] max-sm:leading-4">No campaigns are configured for this template.</p>}
            </section>
          </aside>
        </section>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 px-4 pt-5 sm:flex-row sm:justify-between sm:px-0 max-sm:mt-[5px] max-sm:pt-0">
          <Button variant="outline" onClick={onBack} className="min-h-11 text-sm">Back to templates</Button>
          <Button onClick={onSelect} className="min-h-11 bg-orange-600 px-6 text-sm text-white shadow-sm shadow-orange-200 hover:bg-orange-700">Use this template<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
      <Dialog open={Boolean(editingReward)} onOpenChange={(open) => { if (!open) setEditingReward(null); }}>
        {editingReward && <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:top-[calc(1rem+env(safe-area-inset-top))] [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:h-11 [&_[data-slot=dialog-close]]:w-11 [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]>svg]:h-6 [&_[data-slot=dialog-close]>svg]:w-6 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-xl sm:rounded-2xl sm:border sm:[&_[data-slot=dialog-close]]:right-4 sm:[&_[data-slot=dialog-close]]:top-4 sm:[&_[data-slot=dialog-close]]:h-8 sm:[&_[data-slot=dialog-close]]:w-8 sm:[&_[data-slot=dialog-close]>svg]:h-4 sm:[&_[data-slot=dialog-close]>svg]:w-4">
          <DialogHeader className="border-b border-slate-100 px-5 pt-[calc(19px+env(safe-area-inset-top))] pb-[2px] pr-16 text-left sm:px-7 sm:py-5 sm:pr-14">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600 sm:text-xs">Reward editor</p>
                <DialogTitle className="mt-0.5 truncate text-lg font-bold text-slate-950 sm:mt-1 sm:text-2xl">{editingReward.name}</DialogTitle>
              </div>
            </div>
            <DialogDescription className="-mt-1 text-[12px] text-slate-600 sm:mt-0 sm:text-sm">Update this reward in three short steps.</DialogDescription>
          </DialogHeader>

          <div className="mt-[15px] border-b border-slate-100 px-5 py-[2px] sm:mt-0 sm:px-7 sm:py-4">
            <div role="progressbar" aria-label="Reward edit progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={rewardEditStep} className="hidden h-1.5 overflow-hidden rounded-full bg-slate-100 sm:block">
              <div className={`h-full rounded-full bg-orange-500 transition-all duration-300 ${rewardEditStep === 1 ? "w-1/3" : rewardEditStep === 2 ? "w-2/3" : "w-full"}`} />
            </div>
            <div className="relative mt-[2px] grid grid-cols-3 text-center sm:hidden" role="group" aria-label={`Reward editor step ${rewardEditStep} of 3`}>
              <div className="absolute left-[16.666%] right-[16.666%] top-4 h-0.5 -translate-y-1/2 bg-slate-200" aria-hidden="true">
                <div className={`h-full bg-orange-500 transition-all duration-300 ${rewardEditStep === 1 ? "w-0" : rewardEditStep === 2 ? "w-1/2" : "w-full"}`} />
              </div>
              {[1, 2, 3].map((step) => (
                <span key={step} className="relative z-10 flex justify-center" aria-current={rewardEditStep === step ? "step" : undefined}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors ${rewardEditStep === step ? "border-orange-500 bg-orange-50 text-orange-700" : rewardEditStep > step ? "border-orange-500 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-400"}`}>{step}</span>
                </span>
              ))}
            </div>
            <div className="relative mt-3 hidden grid-cols-3 text-center text-xs font-semibold sm:grid">
              <span className={`flex items-center justify-center gap-2 ${rewardEditStep === 1 ? "text-orange-700" : "text-slate-500"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${rewardEditStep === 1 ? "border-orange-500 bg-orange-50 text-orange-700" : "border-emerald-500 bg-emerald-500 text-white"}`}>{rewardEditStep === 1 ? "1" : <Check className="h-3.5 w-3.5" />}</span>Basic Information</span>
              <span className={`flex items-center justify-center gap-2 ${rewardEditStep === 2 ? "text-orange-700" : rewardEditStep > 2 ? "text-slate-500" : "text-slate-400"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${rewardEditStep === 2 ? "border-orange-500 bg-orange-50 text-orange-700" : rewardEditStep > 2 ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-400"}`}>{rewardEditStep > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}</span>Requirements</span>
              <span className={`flex items-center justify-center gap-2 ${rewardEditStep === 3 ? "text-orange-700" : "text-slate-400"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${rewardEditStep === 3 ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-400"}`}>3</span>Availability</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-[30px] pb-[2px] sm:px-7 sm:py-6">
            <div className="mx-auto max-w-md">
              <div className="mb-[2px] text-center sm:mb-6">
                <h2 className={`text-base font-bold text-slate-950 sm:text-xl ${formTypography.section}`}>{rewardEditStep === 1 ? "Basic Information" : rewardEditStep === 2 ? "Reward Requirements" : "Availability"}</h2>
                <p className="mt-1 text-[12px] leading-5 text-slate-500 sm:text-sm">{rewardEditStep === 1 ? "Set the reward details customers will see." : rewardEditStep === 2 ? "Set the points and stamps needed to redeem this reward." : "Set how many are available and when this reward expires."}</p>
              </div>

              {rewardEditStep === 1 ? (
                <div className="space-y-4">
                  {rewardDetailsAdminManaged && <p className="rounded-xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-[12px] leading-5 text-orange-900 sm:text-sm">Reward name, type, and description are managed by an administrator. You can still change the requirements in the next step.</p>}
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Reward name{!rewardDetailsAdminManaged && <FieldRequirementHint kind="important" />}{rewardDetailsAdminManaged && <span className="ml-1 text-[10px] font-normal text-slate-400 sm:text-xs">· Admin managed</span>}
                    <input disabled={rewardDetailsAdminManaged} value={editingReward.name} onChange={(event) => setEditingReward((current) => current ? { ...current, name: event.target.value } : current)} className={`mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-normal text-slate-900 sm:text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${formTypography.value}`} />
                  </label>
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Reward type{!rewardDetailsAdminManaged && <FieldRequirementHint kind="important" />}{rewardDetailsAdminManaged && <span className="ml-1 text-[10px] font-normal text-slate-400 sm:text-xs">· Admin managed</span>}
                    <Select disabled={rewardDetailsAdminManaged} value={editingReward.rewardType || undefined} onValueChange={(value) => setEditingReward((current) => current ? { ...current, rewardType: value } : current)}>
                      <SelectTrigger className={`mt-1.5 h-11 rounded-xl bg-white text-[12px] font-normal sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${formTypography.value}`}><SelectValue placeholder="Choose a reward type" /></SelectTrigger>
                      <SelectContent>
                        {editingReward.rewardType && !REWARD_TYPES.includes(editingReward.rewardType as (typeof REWARD_TYPES)[number]) && <SelectItem value={editingReward.rewardType}>{editingReward.rewardType}</SelectItem>}
                        {REWARD_TYPES.map((type) => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Description{!rewardDetailsAdminManaged && <FieldRequirementHint kind="important" />}{rewardDetailsAdminManaged && <span className="ml-1 text-[10px] font-normal text-slate-400 sm:text-xs">· Admin managed</span>}
                    <textarea disabled={rewardDetailsAdminManaged} value={editingReward.description || ""} onChange={(event) => setEditingReward((current) => current ? { ...current, description: event.target.value } : current)} rows={3} className={`mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] font-normal text-slate-900 sm:text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${formTypography.value}`} />
                  </label>
                </div>
              ) : rewardEditStep === 2 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Points required<FieldRequirementHint kind="important" />
                    <input type="number" min={0} value={numericDrafts.pointsRequired} onChange={(event) => setNumericDrafts((current) => ({ ...current, pointsRequired: event.target.value }))} className={`mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-900 outline-none sm:text-base transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${formTypography.value}`} />
                  </label>
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Stamps required<FieldRequirementHint kind="important" />
                    <input type="number" min={0} value={numericDrafts.stampsRequired} onChange={(event) => setNumericDrafts((current) => ({ ...current, stampsRequired: event.target.value }))} className={`mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-900 outline-none sm:text-base transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${formTypography.value}`} />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Total quantity
                    <input type="number" min={0} step={1} placeholder="0 = unlimited" value={numericDrafts.quantity} onChange={(event) => setNumericDrafts((current) => ({ ...current, quantity: event.target.value }))} className={`mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-900 outline-none sm:text-base transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${formTypography.value}`} />
                    <span className="mt-1 block text-[11px] font-normal text-slate-500 sm:text-xs">Set to 0 for unlimited availability.</span>
                  </label>
                  <label className={`block text-[12px] font-semibold text-slate-700 sm:text-sm ${formTypography.label}`}>Expiry date <span className="font-normal text-slate-400">(optional)</span>
                    <input type="date" value={editingReward.expiryDatetime?.slice(0, 10) || ""} onChange={(event) => setEditingReward((current) => current ? { ...current, expiryDatetime: event.target.value } : current)} className={`mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-normal text-slate-900 outline-none sm:text-sm transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${formTypography.value}`} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-[2px] border-t border-slate-100 bg-white px-5 pt-[2px] pb-[calc(2px+env(safe-area-inset-bottom))] sm:flex-row sm:justify-between sm:gap-2 sm:px-7 sm:py-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeRewardEditor} className="my-[2px] min-h-11 px-2 py-[2px] text-[12px] sm:my-0 sm:px-4 sm:py-2 sm:text-sm">Cancel</Button>
              {rewardEditStep > 1 && <Button variant="outline" onClick={() => setRewardEditStep((current) => current === 3 ? 2 : 1)} className="my-[2px] min-h-11 px-2 py-[2px] text-[12px] sm:my-0 sm:px-4 sm:py-2 sm:text-sm">Back</Button>}
            </div>
            {rewardEditStep < 3 ? (
              <Button onClick={() => setRewardEditStep((current) => current === 1 ? 2 : 3)} className="my-[2px] min-h-11 px-2 py-[2px] bg-orange-600 text-[12px] text-white hover:bg-orange-700 sm:my-0 sm:px-4 sm:py-2 sm:text-sm">Continue<ArrowRight className="ml-2 h-4 w-4" /></Button>
            ) : (
              <Button onClick={() => saveEditingReward(editingReward)} className="my-[2px] min-h-11 px-2 py-[2px] bg-orange-600 text-[12px] text-white hover:bg-orange-700 sm:my-0 sm:px-4 sm:py-2 sm:text-sm"><Save className="mr-2 h-4 w-4" />Save reward</Button>
            )}
          </DialogFooter>
        </DialogContent>}
      </Dialog>
      {showOverviewScrollHint && !editingReward && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -2, 0] }}
          transition={{ opacity: { duration: 0.2 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
          role="status"
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg sm:hidden"
        >
          Scroll to see more <ArrowDown className="h-3 w-3" aria-hidden="true" />
        </motion.div>
      )}
    </main>
  );
}

function DetailStat({ label, value }: { label: string; value: string | number }) { return <div className="min-w-0 rounded-lg bg-[#f7f8ff] p-2 sm:rounded-2xl sm:p-4"><p className="truncate text-[9px] font-medium text-slate-500 sm:text-xs">{label}</p><p className="mt-0.5 text-xs font-bold capitalize text-slate-900 sm:mt-1 sm:text-sm">{value}</p></div>; }
