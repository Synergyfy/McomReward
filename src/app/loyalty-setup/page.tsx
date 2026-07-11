"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle, Loader2,
  HeartHandshake, Repeat, TrendingUp, Zap, Network, Building2, Users, Settings,
  Gift, Star, Coffee, ShoppingBag, Scissors, Briefcase, Eye, PenLine,
  Stamp, Package, PartyPopper, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useGetLoyaltySetupProgress, useSaveLoyaltySetup,
  useMarkWelcomeSeen, useMarkEcosystemIntroSeen,
  useSelectTemplate, useSaveRewardCustomizations, useSaveCampaignDescriptions,
  getTemplatesForSector,
} from "@/services/loyalty-setup/hook";
import { useGetBusinessProfile } from "@/services/business/hook";
import type { SectorTemplate, TemplateReward, RewardCustomization } from "@/services/loyalty-setup/types";

const BENEFITS = [
  { icon: HeartHandshake, title: "Retain Your Customers", description: "Build lasting relationships with automated loyalty programmes that keep customers coming back." },
  { icon: Repeat, title: "Increase Repeat Purchases", description: "Reward repeat behaviour with points, stamps, and personalised offers that drive frequency." },
  { icon: TrendingUp, title: "Increase Customer Value", description: "Encourage higher spend with tiered rewards, gift cards, and targeted campaigns." },
  { icon: Zap, title: "Simple & Automated", description: "Everything is pre-configured for your business type. Activate in minutes, not hours." },
];

const ECOSYSTEM_STEPS = [
  { icon: Building2, title: "247GBS Creates the Rewards", description: "Our team builds and maintains all loyalty rewards, programmes, and campaigns. You don't need to create anything from scratch." },
  { icon: Users, title: "Choose a Pre-Built Template", description: "Admin-created templates with the right rewards for your sector. Pick one and make it yours." },
  { icon: Settings, title: "Customise & Publish", description: "Edit the reward details to fit your business — then publish to your customers." },
];

const SECTOR_ICONS: Record<string, React.ElementType> = {
  restaurant: Coffee, cafe: Coffee, retail: ShoppingBag, salon: Scissors, service: Briefcase,
};

const REWARD_TYPE_OPTIONS = ["Voucher", "gift card", "coupon", "point offer", "physical product"];

type Step = "welcome" | "ecosystem" | "templates" | "customize" | "campaigns" | "saving";

// ─── WELCOME ──────────────────────────────────────────────────────────────

function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Welcome to MCOM<br /><span className="text-orange-600">Reward & Loyalty</span></h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">Your all-in-one loyalty activation platform. We already understand your business — now let&apos;s set up the tools to reward your customers.</p>
        </div>
        <div className="grid gap-4 mb-10 text-left">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={benefit.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card className="p-4 flex items-start gap-4 border border-orange-100 bg-white/80 hover:bg-orange-50/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Icon className="w-5 h-5 text-orange-600" /></div>
                  <div><h3 className="font-semibold text-gray-900">{benefit.title}</h3><p className="text-sm text-gray-500 mt-0.5">{benefit.description}</p></div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Button size="lg" onClick={onComplete} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">Get Started<ArrowRight className="ml-2 w-5 h-5" /></Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── ECOSYSTEM ────────────────────────────────────────────────────────────

function EcosystemIntroScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-6"><Network className="w-10 h-10 text-white" /></div>
          <h1 className="text-4xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">How the Rewards Network Works</h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">You don&apos;t build loyalty programmes — we do. Just activate the pre-built rewards that make sense for your business.</p>
        </div>
        <div className="grid gap-4 mb-10 text-left">
          {ECOSYSTEM_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Card className="p-4 flex items-start gap-4 border border-orange-100 bg-white/80 hover:bg-orange-50/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Icon className="w-5 h-5 text-orange-600" /></div>
                  <div><h3 className="font-semibold text-gray-900">{step.title}</h3><p className="text-sm text-gray-500 mt-0.5">{step.description}</p></div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-8 text-left">
          <p className="text-sm text-orange-800 font-medium">What this means for you:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="text-sm text-orange-700 flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />Admin-created templates — just pick the right one for your business</li>
            <li className="text-sm text-orange-700 flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />Everything is tailored to your sector</li>
            <li className="text-sm text-orange-700 flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />You customise the wording, pricing, and rewards — then publish</li>
          </ul>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Button size="lg" onClick={onComplete} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">Choose a Template<ArrowRight className="ml-2 w-5 h-5" /></Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── TEMPLATE SELECTION ───────────────────────────────────────────────────

function TemplateCard({ template, isSelected, onSelect, sectorKey }: { template: SectorTemplate; isSelected: boolean; onSelect: (id: string) => void; sectorKey: string }) {
  const SectorIcon = SECTOR_ICONS[sectorKey] || Gift;
  const rewardTypeCount = template.rewards.length;
  const hasStamps = template.rewards.some((r) => r.stampsRequired > 0);
  const hasPoints = template.rewards.some((r) => r.pointsRequired > 0);

  return (
    <Card className={`group relative flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
      isSelected ? "border-orange-500 bg-orange-50/60 shadow-md shadow-orange-100" : "border-gray-200 bg-white hover:border-orange-300"
    }`} onClick={() => onSelect(template.id)}>
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${isSelected ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gray-200"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`relative w-14 h-14 rounded-xl overflow-hidden shadow-md flex items-center justify-center text-2xl ${
              isSelected ? "bg-orange-100" : "bg-gray-50"
            }`}>
              <SectorIcon className={`w-7 h-7 ${isSelected ? "text-orange-600" : "text-gray-400"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{template.description}</p>
            </div>
          </div>
          {isSelected && <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50/50 text-xs">
            <Package className="w-3 h-3 mr-1" />{rewardTypeCount} Rewards
          </Badge>
          {hasStamps && <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50/50 text-xs"><Stamp className="w-3 h-3 mr-1" />Stamps</Badge>}
          {hasPoints && <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50 text-xs"><Star className="w-3 h-3 mr-1" />Points</Badge>}
        </div>
      </div>
    </Card>
  );
}

function TemplateSelectionScreen({ sectorKey, templates, onSelect }: { sectorKey: string; templates: SectorTemplate[]; onSelect: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const displayName = sectorKey === "restaurant" ? "Restaurant & Hospitality" : sectorKey === "cafe" ? "Café & Coffee Shop" : sectorKey === "retail" ? "Retail Business" : sectorKey === "salon" ? "Salon & Beauty" : sectorKey === "service" ? "Service Business" : "Business";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-5"><Package className="w-8 h-8 text-white" /></div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Choose Your Template</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Admin has prepared templates for <span className="font-semibold text-gray-700">{displayName}</span>. Select one to get started.</p>
          </div>
          <div className="grid gap-4 mb-8">
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} isSelected={selectedId === tpl.id} onSelect={setSelectedId} sectorKey={sectorKey} />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" disabled={!selectedId} onClick={() => selectedId && onSelect(selectedId)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed">
              Use This Template<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── REWARD CUSTOMIZATION ─────────────────────────────────────────────────

function RewardEditCard({ reward, customization, onChange }: {
  reward: TemplateReward;
  customization: RewardCustomization;
  onChange: (c: RewardCustomization) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border border-orange-100 overflow-hidden">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center gap-3 p-5 text-left hover:bg-orange-50/50 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-xl flex-shrink-0">{reward.image}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{customization.name || reward.name}</h3>
          <p className="text-xs text-gray-400 truncate">{customization.description || reward.description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="px-5 pb-5">
          <div className="border-t border-orange-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Reward Name</label>
                <Input value={customization.name} onChange={(e) => onChange({ ...customization, name: e.target.value })} className="text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Reward Type</label>
                <Select value={customization.rewardType} onValueChange={(v) => onChange({ ...customization, rewardType: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REWARD_TYPE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <Textarea value={customization.description} onChange={(e) => onChange({ ...customization, description: e.target.value })} rows={2} className="text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Points Required</label>
                <Input type="number" min={0} value={customization.pointsRequired} onChange={(e) => onChange({ ...customization, pointsRequired: Number(e.target.value) })} className="text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Stamps Required</label>
                <Input type="number" min={0} value={customization.stampsRequired} onChange={(e) => onChange({ ...customization, stampsRequired: Number(e.target.value) })} className="text-sm" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function RewardCustomizationScreen({ template, customizations, onSave, onBack }: {
  template: SectorTemplate;
  customizations: Record<string, RewardCustomization>;
  onSave: (c: Record<string, RewardCustomization>) => void;
  onBack: () => void;
}) {
  const [edited, setEdited] = useState<Record<string, RewardCustomization>>(() => {
    if (Object.keys(customizations).length > 0) return customizations;
    const init: Record<string, RewardCustomization> = {};
    for (const r of template.rewards) {
      init[r.key] = { name: r.name, description: r.description, pointsRequired: r.pointsRequired, stampsRequired: r.stampsRequired, rewardType: r.rewardType, image: r.image };
    }
    return init;
  });

  const handleChange = (key: string, c: RewardCustomization) => {
    setEdited((prev) => ({ ...prev, [key]: c }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"><ArrowLeft className="w-4 h-4" />Back to templates</button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-5"><PenLine className="w-8 h-8 text-white" /></div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Customise Your Rewards</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Each reward in <span className="font-semibold text-gray-700">{template.name}</span> is pre-configured. Edit the name, description, pricing, and requirements to fit your business.</p>
          </div>
          <div className="space-y-4 mb-8">
            {template.rewards.map((reward) => (
              <RewardEditCard key={reward.id} reward={reward} customization={edited[reward.key] || { name: reward.name, description: reward.description, pointsRequired: reward.pointsRequired, stampsRequired: reward.stampsRequired, rewardType: reward.rewardType, image: reward.image }} onChange={(c) => handleChange(reward.key, c)} />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={() => { onSave(edited); }} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]">
              Continue to Campaigns<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── CAMPAIGN REVIEW ──────────────────────────────────────────────────────

function CampaignReviewScreen({ template, descriptions, onSave, onBack, isSaving }: {
  template: SectorTemplate;
  descriptions: Record<string, string>;
  onSave: (d: Record<string, string>) => void;
  onBack: () => void;
  isSaving: boolean;
}) {
  const [edited, setEdited] = useState<Record<string, string>>(() => {
    if (Object.keys(descriptions).length > 0) return descriptions;
    const init: Record<string, string> = {};
    for (const c of template.campaigns) init[c.key] = c.description;
    return init;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"><ArrowLeft className="w-4 h-4" />Back to rewards</button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-5"><Eye className="w-8 h-8 text-white" /></div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Review Campaigns</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Campaigns are how customers discover your rewards. Each campaign bundles rewards together — review the messaging below.</p>
          </div>
          <div className="space-y-4 mb-8">
            {template.campaigns.map((camp, i) => (
              <motion.div key={camp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Card className="p-5 border border-orange-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><PartyPopper className="w-4 h-4 text-orange-600" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">{camp.name}</p></div>
                  </div>
                  <Textarea value={edited[camp.key] || ""} onChange={(e) => setEdited((p) => ({ ...p, [camp.key]: e.target.value }))} rows={2} className="text-sm resize-none mb-2" />
                  <div className="flex flex-wrap gap-1.5">
                    {camp.includedRewardKeys.map((rk) => {
                      const rew = template.rewards.find((r) => r.key === rk);
                      return rew ? (
                        <span key={rk} className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                          {rew.image}<span>{rew.name}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" disabled={isSaving} onClick={() => onSave(edited)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]">
              {isSaving ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Publishing...</> : <><CheckCircle className="mr-2 w-5 h-5" />Publish Programme</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── SAVING ───────────────────────────────────────────────────────────────

function SavingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center"><CheckCircle className="w-8 h-8 text-orange-600" /></div>
        <h2 className="text-xl font-semibold text-gray-900">Publishing your programme</h2>
        <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

export default function LoyaltySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [savedCustomizations, setSavedCustomizations] = useState<Record<string, RewardCustomization>>({});
  const [savedDescriptions, setSavedDescriptions] = useState<Record<string, string>>({});

  const { data: progress, isLoading: isProgressLoading } = useGetLoyaltySetupProgress();
  const { data: profile, isLoading: isProfileLoading, isFetched: isProfileFetched } = useGetBusinessProfile();
  const { mutateAsync: markWelcomeSeen } = useMarkWelcomeSeen();
  const { mutateAsync: markEcosystemIntroSeen } = useMarkEcosystemIntroSeen();
  const { mutateAsync: selectTemplate } = useSelectTemplate();
  const { mutateAsync: saveRewardCustomizations } = useSaveRewardCustomizations();
  const { mutateAsync: saveCampaignDescriptions } = useSaveCampaignDescriptions();
  const { mutateAsync: saveSetup, isPending: isSaving } = useSaveLoyaltySetup();

  const sectorKey = profile?.sector?.name || profile?.category?.name || "retail";
  const resolvedSectorKey = (() => {
    const lower = sectorKey.toLowerCase();
    if (lower.includes("restaurant") || lower.includes("food") || lower.includes("dining")) return "restaurant";
    if (lower.includes("cafe") || lower.includes("coffee")) return "cafe";
    if (lower.includes("retail") || lower.includes("shop") || lower.includes("store")) return "retail";
    if (lower.includes("salon") || lower.includes("beauty") || lower.includes("hair")) return "salon";
    if (lower.includes("service") || lower.includes("consult")) return "service";
    return "retail";
  })();

  const templates = getTemplatesForSector(resolvedSectorKey);
  const selectedTemplate = templates.find((t) => t.id === (progress?.selectedTemplateId || ""));

  // Restore step from progress
  useEffect(() => {
    if (progress && !isProgressLoading) {
      if (progress.hasCompletedSetup) router.replace("/dashboard");
      else if (progress.selectedTemplateId) setStep("customize");
      else if (progress.hasSeenEcosystemIntro) setStep("templates");
      else if (progress.hasSeenWelcome) setStep("ecosystem");
    }
  }, [progress, isProgressLoading, router]);

  const handleWelcomeComplete = async () => { await markWelcomeSeen(); setStep("ecosystem"); };
  const handleEcosystemComplete = async () => { await markEcosystemIntroSeen(); setStep("templates"); };
  const handleTemplateSelect = async (id: string) => { await selectTemplate(id); setStep("customize"); };

  const handleCustomizeSave = async (customizations: Record<string, RewardCustomization>) => {
    setSavedCustomizations(customizations);
    await saveRewardCustomizations(customizations);
    setStep("campaigns");
  };

  const handleCustomizeBack = () => setStep("templates");

  const handleCampaignsSave = async (descriptions: Record<string, string>) => {
    setSavedDescriptions(descriptions);
    await saveCampaignDescriptions(descriptions);
    setStep("saving");
    await saveSetup({
      hasSeenWelcome: true, hasSeenEcosystemIntro: true,
      selectedTemplateId: progress?.selectedTemplateId || null,
      rewardCustomizations: savedCustomizations,
      campaignDescriptions: descriptions,
    });
    router.push("/dashboard");
  };

  const handleCampaignsBack = () => setStep("customize");

  if (isProgressLoading || (isProfileLoading && !isProfileFetched)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /><p className="text-gray-500 text-sm">Preparing your setup...</p></div>
      </div>
    );
  }

  if (progress?.hasCompletedSetup) return null;

  return (
    <AnimatePresence mode="wait">
      {step === "welcome" && <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><WelcomeScreen onComplete={handleWelcomeComplete} /></motion.div>}
      {step === "ecosystem" && <motion.div key="ecosystem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><EcosystemIntroScreen onComplete={handleEcosystemComplete} /></motion.div>}
      {step === "templates" && <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><TemplateSelectionScreen sectorKey={resolvedSectorKey} templates={templates} onSelect={handleTemplateSelect} /></motion.div>}
      {step === "customize" && selectedTemplate && <motion.div key="customize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><RewardCustomizationScreen template={selectedTemplate} customizations={progress?.rewardCustomizations || {}} onSave={handleCustomizeSave} onBack={handleCustomizeBack} /></motion.div>}
      {step === "campaigns" && selectedTemplate && <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><CampaignReviewScreen template={selectedTemplate} descriptions={progress?.campaignDescriptions || {}} onSave={handleCampaignsSave} onBack={handleCampaignsBack} isSaving={isSaving} /></motion.div>}
      {step === "saving" && <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><SavingScreen /></motion.div>}
    </AnimatePresence>
  );
}
