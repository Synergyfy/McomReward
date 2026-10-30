"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Gift, Megaphone, Loader2, RefreshCw, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TemplateCampaign, TemplateReward } from "@/services/loyalty-setup/types";
import type { AdminCampaignTemplate } from "@/services/campaigns/types";
import FieldRequirementHint from "@/components/onboarding/FieldRequirementHint";
import { formTypography } from "./formTypography";
import SetupProgress from "./SetupProgress";

interface CampaignsScreenProps {
  campaigns: AdminCampaignTemplate[];
  templateRewards: TemplateReward[];
  initialSelectedCampaigns?: TemplateCampaign[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onComplete: (campaigns: TemplateCampaign[]) => void;
  onBack: () => void;
}


function campaignKey(campaign: AdminCampaignTemplate) {
  return campaign.id;
}

function humanize(value?: string | null) {
  return value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "";
}

function formatNumber(value?: number | null) {
  return value == null ? null : new Intl.NumberFormat().format(value);
}

function CampaignProgress() {
  return <SetupProgress currentStep={3} className="mx-auto mb-4 max-w-5xl max-sm:mb-2" />;
}

function CampaignArtwork({ campaign, compact = false }: { campaign: AdminCampaignTemplate; compact?: boolean }) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const name = campaign.name || "Campaign";
  const bannerUrl = campaign.banner_url || campaign.bannerUrl;
  const logoUrl = campaign.logo_url || campaign.logoUrl;

  return (
    <div className={"relative isolate overflow-hidden bg-slate-100 " + (compact ? "h-28 rounded-t-2xl sm:h-36" : "h-32 rounded-2xl sm:h-48 lg:h-60")}>
      {bannerUrl && !bannerFailed ? (
        <Image src={bannerUrl} alt={name + " campaign banner"} fill unoptimized sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" onError={() => setBannerFailed(true)} />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 text-orange-500">
          <Megaphone className="h-12 w-12" strokeWidth={1.3} />
        </div>
      )}
      {logoUrl && !logoFailed && (
        <div className={"absolute bottom-3 left-3 overflow-hidden rounded-xl border border-white bg-white shadow-sm " + (compact ? "h-14 w-14" : "h-12 w-12 sm:h-16 sm:w-16")}>
          <Image src={logoUrl} alt={name + " logo"} fill unoptimized sizes="64px" className="object-contain p-0.5" onError={() => setLogoFailed(true)} />
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, assignedCount, onOpen }: { campaign: AdminCampaignTemplate; assignedCount: number; onOpen: () => void }) {
  const campaignType = humanize(campaign.campaign_type || campaign.campaignType);
  const audience = humanize(campaign.audience_type || campaign.audienceType);
  const message = campaign.campaign_message || campaign.campaignMessage;

  return (
    <article role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }} aria-label={`View ${campaign.name} campaign details`} className="flex min-w-0 w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
      <CampaignArtwork campaign={campaign} compact />
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {campaignType && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 sm:px-2.5 sm:py-1 sm:text-[11px]">{campaignType}</span>}
          {audience && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800 sm:px-2.5 sm:py-1 sm:text-[11px]">{audience}</span>}
        </div>
        <h2 className="mt-1 text-sm font-semibold leading-5 text-slate-950 sm:mt-3 sm:text-lg sm:leading-6">{campaign.name}</h2>
        {message && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600 sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-5">{message}</p>}
        <div className="mt-2 flex items-center justify-between gap-3 sm:mt-auto sm:pt-5">
          <span className={"inline-flex items-center gap-1.5 text-xs font-medium " + (assignedCount ? "text-emerald-700" : "text-slate-500")}>
            {assignedCount ? <><CheckCircle2 className="h-4 w-4" />{assignedCount} {assignedCount === 1 ? "reward" : "rewards"} assigned</> : "Not added"}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

export default function CampaignsScreen({
  campaigns,
  templateRewards,
  initialSelectedCampaigns = [],
  isLoading,
  isError,
  onRetry,
  onComplete,
  onBack,
}: CampaignsScreenProps) {
  const availableCampaigns = campaigns.filter((campaign) => !campaign.disabled);
  const initialAssignments = useMemo(
    () => Object.fromEntries(initialSelectedCampaigns.map((campaign) => [campaign.key, campaign.includedRewardKeys || []])),
    [initialSelectedCampaigns],
  );
  const [assignments, setAssignments] = useState<Record<string, string[]>>(initialAssignments);
  const [activeCampaign, setActiveCampaign] = useState<AdminCampaignTemplate | null>(null);

  const handleSaveAssignment = (campaign: AdminCampaignTemplate, rewardKeys: string[]) => {
    setAssignments((current) => {
      const next = { ...current };
      if (rewardKeys.length) next[campaignKey(campaign)] = rewardKeys;
      else delete next[campaignKey(campaign)];
      return next;
    });
    setActiveCampaign(null);
  };

  const handleContinue = () => {
    const chosen = availableCampaigns
      .filter((campaign) => (assignments[campaignKey(campaign)] || []).length > 0)
      .map((campaign) => ({
        id: campaign.id,
        key: campaignKey(campaign),
        name: campaign.name,
        description: campaign.campaign_message || campaign.campaignMessage || "",
        includedRewardKeys: assignments[campaignKey(campaign)] || [],
      }));
    onComplete(chosen);
  };

  if (activeCampaign) {
    return (
      <CampaignDetailPage
        campaign={activeCampaign}
        rewards={templateRewards}
        assignedRewardKeys={assignments[campaignKey(activeCampaign)] || []}
        onBack={() => setActiveCampaign(null)}
        onSave={(rewardKeys) => handleSaveAssignment(activeCampaign, rewardKeys)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-3 sm:px-7 sm:py-6 lg:px-10 lg:py-7">
        <button type="button" onClick={onBack} className="mb-1.5 inline-flex w-fit cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-orange-700 sm:mb-5 sm:gap-2 sm:rounded-lg sm:px-2 sm:py-2 sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Back
        </button>
        <CampaignProgress />

        <header className="mb-7 flex flex-col gap-2 border-b border-slate-200 pb-6 max-sm:mb-3 max-sm:gap-1 max-sm:pb-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-orange-600 sm:mb-2 sm:text-[11px] sm:tracking-[0.16em]">Step 3 · Campaigns</p>
            </div>
            <h1 className="text-[18px] font-bold leading-6 tracking-tight text-slate-950 sm:text-3xl">Choose your campaigns</h1>
            <p className="mt-1 max-w-2xl text-[11px] leading-4 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">Open a campaign to review its details and link it to the rewards in your programme.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-orange-500" />Loading campaigns…</div>
        ) : isError ? (
          <div role="alert" className="mx-auto w-full max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center">
            <p className="text-sm text-red-800">Campaigns couldn’t be loaded.</p>
            <Button variant="outline" onClick={onRetry} className="mt-4"><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
          </div>
        ) : availableCampaigns.length === 0 ? (
          <div className="mx-auto flex min-h-56 w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Megaphone className="h-5 w-5" /></span>
            <h2 className="text-lg font-semibold text-slate-900">No campaigns available</h2>
            <p className="mt-2 max-w-md text-sm leading-5 text-slate-600">There are no active campaigns published for this setup right now. You can continue and add campaigns later.</p>
          </div>
        ) : (
          <div className="grid items-stretch gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {availableCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} assignedCount={(assignments[campaignKey(campaign)] || []).length} onOpen={() => setActiveCampaign(campaign)} />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-auto flex flex-col items-center gap-2 border-t border-slate-200 pt-3 sm:gap-3 sm:pt-8">
            <Button onClick={handleContinue} className="h-11 w-full cursor-pointer rounded-xl bg-orange-600 px-5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(255,91,0,0.18)] hover:bg-orange-700 sm:h-12 sm:w-auto sm:min-w-[240px] sm:px-7 sm:text-sm">
              Continue to review<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            {Object.keys(assignments).length === 0 && <p className="text-center text-xs text-slate-500">Campaigns are optional. You can continue without adding one.</p>}
          </div>
        )}
      </div>
    </main>
  );
}

function CampaignDetailPage({
  campaign,
  rewards,
  assignedRewardKeys,
  onBack,
  onSave,
}: {
  campaign: AdminCampaignTemplate;
  rewards: TemplateReward[];
  assignedRewardKeys: string[];
  onBack: () => void;
  onSave: (rewardKeys: string[]) => void;
}) {
  const [selectedRewardKeys, setSelectedRewardKeys] = useState<string[]>(assignedRewardKeys);
  const campaignType = humanize(campaign.campaign_type || campaign.campaignType);
  const audience = humanize(campaign.audience_type || campaign.audienceType);
  const rewardMode = humanize(campaign.reward_mode || campaign.rewardMode);
  const targetTiers = campaign.targetTiers?.map((tier) => tier.name).filter(Boolean).join(", ");
  const overview = [
    ["Campaign type", campaignType],
    ["Audience", audience],
    ["Reward mode", rewardMode],
    ["Sign-up points", formatNumber(campaign.signUpPoint)],
    ["Points threshold", formatNumber(campaign.regular_points_threshold ?? campaign.regularPointsThreshold)],
    ["Initial audience", formatNumber(campaign.initial_audience_size ?? campaign.initialAudienceSize)],
    ["Eligible tiers", targetTiers],
    ["Campaign code", campaign.uniqueCode],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const hasChanges = selectedRewardKeys.length !== assignedRewardKeys.length || selectedRewardKeys.some((key) => !assignedRewardKeys.includes(key));

  const toggleReward = (key: string) => {
    setSelectedRewardKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-3 sm:px-7 sm:py-6 lg:px-10 lg:py-7">
        <button type="button" onClick={onBack} className="mb-2 inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-orange-700 sm:mb-5 sm:min-h-10 sm:gap-2 sm:rounded-lg sm:px-2 sm:py-2 sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Back
        </button>

        <div className="grid items-start gap-3 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-8">
          <section className="order-2 min-w-0 lg:order-1">
            <CampaignArtwork campaign={campaign} />
            <div className="mt-3 sm:mt-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-orange-600 sm:text-[11px] sm:tracking-[0.16em]">Campaign overview</p>
              <h1 className="mt-1 text-lg font-bold leading-6 tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">{campaign.name}</h1>
              {campaign.campaign_message || campaign.campaignMessage ? (
                <p className="mt-1.5 whitespace-pre-line text-xs leading-4 text-slate-700 sm:mt-3 sm:text-base sm:leading-6">{campaign.campaign_message || campaign.campaignMessage}</p>
              ) : null}
            </div>

            {overview.length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                {overview.map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 sm:rounded-xl sm:px-4 sm:py-3">
                    <dt className="text-[9px] font-bold uppercase leading-3 tracking-[0.08em] text-slate-500 sm:text-[10px] sm:leading-4 sm:tracking-[0.12em]">{label}</dt>
                    <dd className="mt-0.5 break-words text-[11px] font-medium leading-4 text-slate-900 sm:mt-1 sm:text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {!!campaign.rewards?.length && (
              <section className="mt-4 sm:mt-6">
                <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">Rewards published with this campaign</h2>
                <div className="mt-2 grid gap-2 sm:mt-3 sm:grid-cols-2">
                  {campaign.rewards.map((reward) => (
                    <div key={reward.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Gift className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{reward.title}</p>
                        {reward.description && <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-600">{reward.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>

          <section className="order-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5 lg:order-2">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 sm:gap-3 sm:pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-orange-600 sm:text-[11px] sm:tracking-[0.14em]">Link rewards</p>
                <h2 className="mt-0.5 text-base font-bold leading-5 tracking-tight text-slate-950 sm:mt-1 sm:text-xl">Which rewards can this campaign use?<FieldRequirementHint kind="required" explanation="Select at least one reward to add this campaign." mobileExplanation="Pick a reward to add it." /></h2>
                <p className="mt-1 text-[11px] leading-4 text-slate-600 sm:mt-2 sm:text-sm sm:leading-5">Select the rewards from your programme that belong with this campaign.</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{selectedRewardKeys.length} selected</span>
            </div>

            {rewards.length ? (
              <fieldset className="mt-2 space-y-1.5 sm:mt-4 sm:space-y-2">
                <legend className="sr-only">Select rewards for {campaign.name}</legend>
                {rewards.map((reward) => {
                  const key = reward.key || reward.id;
                  const checked = selectedRewardKeys.includes(key);
                  return (
                    <label key={key} className={"flex cursor-pointer items-start gap-2 rounded-lg border p-2 transition sm:gap-3 sm:rounded-xl sm:p-3 " + (checked ? "border-orange-300 bg-orange-50/70" : "border-slate-200 bg-white hover:border-slate-300")}>
                      <input type="checkbox" checked={checked} onChange={() => toggleReward(key)} className="mt-1 h-4 w-4 cursor-pointer accent-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600" />
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg ring-1 ring-slate-100" aria-hidden="true">{reward.image || <Gift className="h-4 w-4 text-orange-500" />}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold text-slate-900 ${formTypography.value}`}>{reward.name}</span>
                        {reward.description && <span className={`mt-0.5 block text-xs leading-4 text-slate-600 ${formTypography.helper}`}>{reward.description}</span>}
                        <span className={`mt-1 block text-[11px] text-slate-500 ${formTypography.helper}`}>
                          {reward.rewardType}{reward.pointsRequired ? " · " + reward.pointsRequired + " points" : ""}{reward.stampsRequired ? " · " + reward.stampsRequired + " stamps" : ""}
                        </span>
                      </span>
                      {checked && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />}
                    </label>
                  );
                })}
              </fieldset>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-5 text-slate-600">
                <Sparkles className="mb-2 h-5 w-5 text-orange-500" />
                No rewards are in this template yet. Go back to rewards and add one before linking this campaign.
              </div>
            )}

            <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2 sm:mt-5 sm:gap-2 sm:pt-4">
              <Button onClick={() => onSave(selectedRewardKeys)} disabled={!rewards.length || (!selectedRewardKeys.length && !assignedRewardKeys.length)} className="h-11 w-full cursor-pointer rounded-xl bg-orange-600 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">
                {assignedRewardKeys.length ? hasChanges ? "Save reward links" : "Done" : "Add campaign"}<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {assignedRewardKeys.length > 0 && (
                <Button variant="outline" onClick={() => onSave([])} className="h-10 cursor-pointer border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                  Remove campaign from setup
                </Button>
              )}
              <p className="text-center text-xs text-slate-500">You can change these links before finishing setup.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
