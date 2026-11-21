"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetLoyaltySetupProgress, useSaveLoyaltySetup, useSkipLoyaltySetup,
  useMarkWelcomeSeen, useMarkEcosystemIntroSeen, useSaveCampaignSelections,
  useSelectTemplate, useSaveRewardCustomizations, useSaveCampaignDescriptions,
  useGetBusinessLoyaltySetupTemplates,
} from "@/services/loyalty-setup/hook";
import { useGetBusinessProfile } from "@/services/business/hook";
import { useGetAvailableAdminCampaigns } from "@/services/campaigns/hook";
import type { SectorTemplate, RewardCustomization } from "@/services/loyalty-setup/types";

import WelcomeScreen from "./_screens/WelcomeScreen";
import ProfileScreen from "./_screens/ProfileScreen";
import TemplateScreen from "./_screens/TemplateScreen";
import CampaignsScreen from "./_screens/CampaignsScreen";
import ReviewScreen from "./_screens/ReviewScreen";

type Step = "welcome" | "profile" | "templates" | "campaigns" | "review" | "saving";

function SavingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Saving your onboarding setup</h2>
        <p className="text-gray-500 text-sm">Taking you to your dashboard…</p>
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    </div>
  );
}

export default function LoyaltySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const hasInitializedStep = useRef(false);
  const [savedCustomizations, setSavedCustomizations] = useState<Record<string, RewardCustomization>>({});
  const [templateOverrides, setTemplateOverrides] = useState<Record<string, SectorTemplate>>({});
  const [centralBusinessProfile, setCentralBusinessProfile] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mcom_central_business_profile");
      if (stored) setCentralBusinessProfile(JSON.parse(stored));
    } catch {
      setCentralBusinessProfile(null);
    }
  }, []);

  const { data: progress, isLoading: isProgressLoading } = useGetLoyaltySetupProgress();
  const { data: profile, isLoading: isProfileLoading, isFetched: isProfileFetched } = useGetBusinessProfile();
  const { data: allTemplates = [], isLoading: areTemplatesLoading, isError: templatesFailed, refetch: refetchTemplates } = useGetBusinessLoyaltySetupTemplates();
  const { data: adminCampaignPage, isLoading: areAdminCampaignsLoading, isError: adminCampaignsFailed, refetch: refetchAdminCampaigns } = useGetAvailableAdminCampaigns();
  const { mutateAsync: markWelcomeSeen } = useMarkWelcomeSeen();
  const { mutateAsync: skipLoyaltySetup } = useSkipLoyaltySetup();
  const { mutateAsync: markEcosystemIntroSeen } = useMarkEcosystemIntroSeen();
  const { mutateAsync: selectTemplate } = useSelectTemplate();
  const { mutateAsync: saveRewardCustomizations } = useSaveRewardCustomizations();
  const { mutateAsync: saveCampaignDescriptions } = useSaveCampaignDescriptions();
  const { mutateAsync: saveCampaignSelections } = useSaveCampaignSelections();
  const { mutateAsync: saveSetup, isPending: isSaving } = useSaveLoyaltySetup();

  const sectorKey = centralBusinessProfile?.industry || centralBusinessProfile?.category || profile?.sector?.name || profile?.category?.name || "retail";
  const resolvedSectorKey = (() => {
    const lower = sectorKey.toLowerCase();
    if (lower.includes("custom")) return "custom";
    if (lower.includes("gym") || lower.includes("fitness") || lower.includes("sport")) return "gym";
    if (lower.includes("restaurant") || lower.includes("food") || lower.includes("dining")) return "restaurant";
    if (lower.includes("cafe") || lower.includes("coffee")) return "cafe";
    if (lower.includes("retail") || lower.includes("shop") || lower.includes("store")) return "retail";
    if (lower.includes("salon") || lower.includes("beauty") || lower.includes("hair")) return "salon";
    if (lower.includes("service") || lower.includes("consult")) return "service";
    return "retail";
  })();

  const templates = allTemplates
    .map((template) => templateOverrides[template.id] || template)
    .sort((first, second) => {
      const firstMatchesBusiness = first.sectorKey.toLowerCase() === resolvedSectorKey;
      const secondMatchesBusiness = second.sectorKey.toLowerCase() === resolvedSectorKey;
      return Number(secondMatchesBusiness) - Number(firstMatchesBusiness);
    });
  const selectedTemplate = templates.find((t) => t.id === (progress?.selectedTemplateId || ""));

  useEffect(() => {
    const templateId = progress?.selectedTemplateId;
    const savedCampaigns = progress?.selectedCampaigns;
    const savedCustomizations = progress?.rewardCustomizations || {};
    const savedDescriptions = progress?.campaignDescriptions || {};
    const baseTemplate = allTemplates.find((template) => template.id === templateId);
    if (!templateId || !baseTemplate || !savedCampaigns) return;

    setTemplateOverrides((current) => {
      const currentTemplate = current[templateId] || baseTemplate;
      const rewards = (currentTemplate.rewards || []).map((reward) => {
        const customization = savedCustomizations[reward.id] || savedCustomizations[reward.key];
        return customization
          ? { ...reward, ...customization, isCustomized: true }
          : reward;
      });
      const campaigns = savedCampaigns.map((campaign) => ({
        ...campaign,
        description: savedDescriptions[campaign.key] ?? campaign.description,
      }));

      const rewardsUnchanged = rewards.every((reward, index) =>
        reward === (currentTemplate.rewards || [])[index],
      );
      const campaignsUnchanged = campaigns.every((campaign, index) => {
        const existing = currentTemplate.campaigns?.[index];
        return existing && existing.key === campaign.key && existing.description === campaign.description;
      }) && campaigns.length === (currentTemplate.campaigns?.length || 0);

      if (rewardsUnchanged && campaignsUnchanged) return current;
      return { ...current, [templateId]: { ...currentTemplate, rewards, campaigns } };
    });
  }, [
    allTemplates,
    progress?.selectedTemplateId,
    progress?.selectedCampaigns,
    progress?.rewardCustomizations,
    progress?.campaignDescriptions,
  ]);

  useEffect(() => {
    if (!progress || isProgressLoading || hasInitializedStep.current) return;
    if (progress.hasCompletedSetup) {
      hasInitializedStep.current = true;
      router.replace("/dashboard");
      return;
    }
    if (progress.selectedTemplateId && areTemplatesLoading) return;

    hasInitializedStep.current = true;
    if (progress.selectedTemplateId && !selectedTemplate) setStep("templates");
    else if (progress.selectedTemplateId && selectedTemplate) setStep("campaigns");
    else if (progress.hasSeenEcosystemIntro) setStep("templates");
    else if (progress.hasSeenWelcome) setStep("profile");
  }, [progress, isProgressLoading, areTemplatesLoading, selectedTemplate, router]);

  const handleWelcomeComplete = async () => {
    try {
      await markWelcomeSeen();
      setStep("profile");
    } catch {
      toast.error("We couldn't save your progress. Please try again.");
    }
  };
  const handleWelcomeSkip = async () => {
    try {
      await skipLoyaltySetup();
      router.push("/dashboard");
    } catch {
      toast.error("We couldn't skip setup right now. Please try again.");
    }
  };
  const handleProfileComplete = async () => {
    try {
      await markEcosystemIntroSeen();
      setStep("templates");
    } catch {
      toast.error("We couldn't save your progress. Please try again.");
    }
  };
  const handleProfileBack = () => setStep("welcome");
  const handleTemplateSelect = async (id: string) => {
    try {
      await selectTemplate(id);
      setStep("campaigns");
    } catch {
      toast.error("We couldn't select that template. Please try again.");
    }
  };
  const handleTemplateBack = () => setStep("profile");

  const handleTemplateSave = (template: SectorTemplate) => {
    setTemplateOverrides((current) => ({ ...current, [template.id]: template }));
    const updatedCustomizations = Object.fromEntries(template.rewards.map((reward) => [reward.id, {
      name: reward.name,
      description: reward.description,
      pointsRequired: reward.pointsRequired || 0,
      stampsRequired: reward.stampsRequired || 0,
      rewardType: reward.rewardType,
      image: reward.image,
      quantity: reward.quantity ?? 0,
      expiryDatetime: reward.expiryDatetime ?? "",
    }]));
    const nextCustomizations = { ...savedCustomizations, ...updatedCustomizations };
    setSavedCustomizations(nextCustomizations);
    void saveRewardCustomizations(nextCustomizations).catch(() => {
      toast.error("We couldn't save your reward changes. Please try again.");
    });
  };

  const handleCampaignsComplete = async (campaigns: SectorTemplate["campaigns"]) => {
    const selected = templates.find((template) => template.id === progress?.selectedTemplateId);
    if (selected) {
      setTemplateOverrides((current) => {
        const currentTemplate = current[selected.id] || selected;
        return { ...current, [selected.id]: { ...currentTemplate, campaigns } };
      });
    }
    try {
      await saveCampaignDescriptions(Object.fromEntries(campaigns.map((campaign) => [campaign.key, campaign.description])));
      await saveCampaignSelections(campaigns);
      setStep("review");
    } catch {
      toast.error("We couldn't save your campaign selections. Please try again.");
    }
  };
  const handleCampaignsBack = () => setStep("templates");

  const handleReviewSave = async (descriptions: Record<string, string>) => {
    setStep("saving");
    try {
      await saveCampaignDescriptions(descriptions);
      await saveSetup({
        hasSeenWelcome: true,
        hasSeenEcosystemIntro: true,
        selectedTemplateId: progress?.selectedTemplateId || null,
        selectedCampaigns: (selectedTemplate?.campaigns || []).map((campaign) => ({ ...campaign, description: descriptions[campaign.key] ?? campaign.description })),
        rewardCustomizations: savedCustomizations,
        campaignDescriptions: descriptions,
        enabledEngines: progress?.enabledEngines ?? null,
        tierConfig: progress?.tierConfig ?? selectedTemplate?.tierConfig ?? null,
      });
      router.push("/dashboard");
    } catch (error) {
      setStep("review");
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof message === "string" ? message : "We couldn't save your setup. Please try again.");
    }
  };
  const handleReviewBack = () => setStep("campaigns");

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

  return (
    <div>
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <WelcomeScreen onComplete={handleWelcomeComplete} onSkip={handleWelcomeSkip} />
          </motion.div>
        )}
        {step === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ProfileScreen onComplete={handleProfileComplete} onBack={handleProfileBack} />
          </motion.div>
        )}
        {step === "templates" && (
          <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {areTemplatesLoading ? (
              <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-500"><Loader2 className="h-6 w-6 animate-spin text-orange-500" />Loading MCOM Rewards templates…</div>
            ) : templatesFailed ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"><p className="text-gray-600">We couldn&apos;t load MCOM Rewards templates. Please try again.</p><button onClick={() => void refetchTemplates()} className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600">Try again</button></div>
            ) : templates.length === 0 ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center"><h2 className="text-xl font-semibold text-gray-900">No templates available yet</h2><p className="max-w-md text-gray-500">There are no MCOM Rewards templates set up for your business type. Please contact your administrator.</p><button onClick={handleTemplateBack} className="text-sm font-medium text-orange-600 hover:text-orange-700">Go back</button></div>
            ) : (
              <TemplateScreen
                sectorKey={resolvedSectorKey}
                templates={templates}
                onSelect={handleTemplateSelect}
                onBack={handleTemplateBack}
                onTemplateSave={handleTemplateSave}
              />
            )}
          </motion.div>
        )}
        {step === "campaigns" && selectedTemplate && (
          <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CampaignsScreen
              campaigns={adminCampaignPage?.data || []}
              templateRewards={selectedTemplate.rewards || []}
              initialSelectedCampaigns={progress?.selectedCampaigns || []}
              isLoading={areAdminCampaignsLoading}
              isError={adminCampaignsFailed}
              onRetry={() => void refetchAdminCampaigns()}
              onComplete={handleCampaignsComplete}
              onBack={handleCampaignsBack}
            />
          </motion.div>
        )}
        {step === "review" && selectedTemplate && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ReviewScreen
              template={selectedTemplate}
              profile={profile}
              centralBusinessProfile={centralBusinessProfile || undefined}
              campaignDetails={adminCampaignPage?.data || []}
              businessName={centralBusinessProfile?.businessName || profile?.name}
              businessCategory={centralBusinessProfile?.category || centralBusinessProfile?.industry || profile?.sector?.name || profile?.category?.name}
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
