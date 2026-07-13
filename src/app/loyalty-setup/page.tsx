"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  useGetLoyaltySetupProgress, useSaveLoyaltySetup,
  useMarkWelcomeSeen, useMarkEcosystemIntroSeen,
  useSelectTemplate, useSaveRewardCustomizations, useSaveCampaignDescriptions,
  useSaveTierConfig,
  getTemplatesForSector,
} from "@/services/loyalty-setup/hook";
import { useGetBusinessProfile } from "@/services/business/hook";
import type { SectorTemplate, RewardCustomization, TierConfig } from "@/services/loyalty-setup/types";

import WelcomeScreen from "./_screens/WelcomeScreen";
import ProfileScreen from "./_screens/ProfileScreen";
import TemplateScreen from "./_screens/TemplateScreen";
import CampaignsScreen from "./_screens/CampaignsScreen";
import TiersScreen from "./_screens/TiersScreen";
import ReviewScreen from "./_screens/ReviewScreen";

type Step = "welcome" | "profile" | "templates" | "campaigns" | "tiers" | "review" | "saving";

const STEP_INDEX: Record<string, number> = {
  welcome: 0, profile: 1, templates: 2, campaigns: 3, tiers: 4, review: 5, saving: 6,
};

const TOTAL_STEPS = 5;

function SavingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Activating your programme</h2>
        <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    </div>
  );
}

export default function LoyaltySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [savedCustomizations, setSavedCustomizations] = useState<Record<string, RewardCustomization>>({});
  const [savedTierConfig, setSavedTierConfig] = useState<TierConfig | null>(null);

  const { data: progress, isLoading: isProgressLoading } = useGetLoyaltySetupProgress();
  const { data: profile, isLoading: isProfileLoading, isFetched: isProfileFetched } = useGetBusinessProfile();
  const { mutateAsync: markWelcomeSeen } = useMarkWelcomeSeen();
  const { mutateAsync: markEcosystemIntroSeen } = useMarkEcosystemIntroSeen();
  const { mutateAsync: selectTemplate } = useSelectTemplate();
  const { mutateAsync: saveRewardCustomizations } = useSaveRewardCustomizations();
  const { mutateAsync: saveCampaignDescriptions } = useSaveCampaignDescriptions();
  const { mutateAsync: saveTierConfig } = useSaveTierConfig();
  const { mutateAsync: saveSetup, isPending: isSaving } = useSaveLoyaltySetup();

  const sectorKey = profile?.sector?.name || profile?.category?.name || "retail";
  const resolvedSectorKey = (() => {
    const lower = sectorKey.toLowerCase();
    if (lower.includes("restaurant") || lower.includes("food") || lower.includes("dining")) return "restaurant";
    if (lower.includes("cafe") || lower.includes("coffee")) return "cafe";
    if (lower.includes("retail") || lower.includes("shop") || lower.includes("store")) return "retail";
    if (lower.includes("salon") || lower.includes("beauty") || lower.includes("hair")) return "salon";
    if (lower.includes("gym") || lower.includes("fitness") || lower.includes("sport")) return "gym";
    if (lower.includes("service") || lower.includes("consult")) return "service";
    return "retail";
  })();

  const templates = getTemplatesForSector(resolvedSectorKey);
  const selectedTemplate = templates.find((t) => t.id === (progress?.selectedTemplateId || ""));

  useEffect(() => {
    if (progress && !isProgressLoading) {
      if (progress.hasCompletedSetup) router.replace("/dashboard");
      else if (progress.tierConfig) setStep("tiers");
      else if (progress.selectedTemplateId) setStep("campaigns");
      else if (progress.hasSeenEcosystemIntro) setStep("templates");
      else if (progress.hasSeenWelcome) setStep("profile");
    }
  }, [progress, isProgressLoading, router]);

  const handleWelcomeComplete = async () => { await markWelcomeSeen(); setStep("profile"); };
  const handleWelcomeSkip = () => router.push("/dashboard");
  const handleProfileComplete = async () => { await markEcosystemIntroSeen(); setStep("templates"); };
  const handleTemplateSelect = async (id: string) => { await selectTemplate(id); setStep("campaigns"); };
  const handleTemplateBack = () => setStep("profile");

  const handleCampaignsComplete = async () => { setStep("tiers"); };
  const handleCampaignsBack = () => setStep("templates");

  const handleTierConfigSave = async (config: TierConfig) => {
    setSavedTierConfig(config);
    await saveTierConfig(config);
    setStep("review");
  };
  const handleTierConfigSkip = async () => {
    const defaultConfig: TierConfig = { enabled: false, tiers: [] };
    setSavedTierConfig(defaultConfig);
    await saveTierConfig(defaultConfig);
    setStep("review");
  };
  const handleTierConfigBack = () => setStep("campaigns");

  const handleReviewSave = async (descriptions: Record<string, string>) => {
    await saveCampaignDescriptions(descriptions);
    setStep("saving");
    await saveSetup({
      hasSeenWelcome: true,
      hasSeenEcosystemIntro: true,
      selectedTemplateId: progress?.selectedTemplateId || null,
      rewardCustomizations: savedCustomizations,
      campaignDescriptions: descriptions,
      enabledEngines: null,
      tierConfig: savedTierConfig || null,
    });
    router.push("/dashboard");
  };
  const handleReviewBack = () => {
    if (savedTierConfig?.enabled) setStep("tiers");
    else setStep("campaigns");
  };

  const handleJumpTo = (targetStep: string) => {
    setStep(targetStep as Step);
  };

  if (isProgressLoading || (isProfileLoading && !isProfileFetched)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /><p className="text-gray-500 text-sm">Preparing your setup...</p></div>
      </div>
    );
  }

  if (progress?.hasCompletedSetup) return null;

  const showProgress = step !== "welcome" && step !== "saving";
  const progressPercent = showProgress ? ((STEP_INDEX[step] || 0) / TOTAL_STEPS) * 100 : 0;

  const renderProgressBar = () => {
    if (!showProgress) return null;
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-orange-100 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Step {STEP_INDEX[step]} of {TOTAL_STEPS}</span>
            <span className="text-xs font-medium text-orange-500">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" indicatorClassName="bg-orange-500" />
        </div>
      </div>
    );
  };

  return (
    <div className={showProgress ? "pt-14" : ""}>
      {renderProgressBar()}
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <WelcomeScreen onComplete={handleWelcomeComplete} onSkip={handleWelcomeSkip} />
          </motion.div>
        )}
        {step === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ProfileScreen onComplete={handleProfileComplete} onBack={handleWelcomeComplete} />
          </motion.div>
        )}
        {step === "templates" && (
          <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TemplateScreen sectorKey={resolvedSectorKey} templates={templates} onSelect={handleTemplateSelect} onBack={handleTemplateBack} />
          </motion.div>
        )}
        {step === "campaigns" && selectedTemplate && (
          <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CampaignsScreen
              template={selectedTemplate}
              templateRewards={selectedTemplate.rewards}
              onComplete={handleCampaignsComplete}
              onBack={handleCampaignsBack}
            />
          </motion.div>
        )}
        {step === "tiers" && (
          <motion.div key="tiers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TiersScreen initialConfig={savedTierConfig || progress?.tierConfig || null} onComplete={handleTierConfigSave} onBack={handleTierConfigBack} onSkip={handleTierConfigSkip} />
          </motion.div>
        )}
        {step === "review" && selectedTemplate && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ReviewScreen
              template={selectedTemplate}
              customizations={progress?.rewardCustomizations || savedCustomizations}
              engines={null}
              tierConfig={savedTierConfig || progress?.tierConfig || null}
              onSave={handleReviewSave}
              onBack={handleReviewBack}
              onJumpTo={handleJumpTo}
              isSaving={isSaving}
            />
          </motion.div>
        )}
        {step === "saving" && (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SavingScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
