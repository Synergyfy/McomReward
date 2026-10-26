"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Gift, Megaphone, Store, Trophy, Loader2, Pencil, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { SectorTemplate, TierConfig } from "@/services/loyalty-setup/types";
import type { BusinessProfile } from "@/services/business/types";
import type { AdminCampaignTemplate } from "@/services/campaigns/types";
import FieldRequirementHint from "@/components/onboarding/FieldRequirementHint";

interface ReviewScreenProps {
  template: SectorTemplate;
  profile?: BusinessProfile;
  centralBusinessProfile?: Record<string, string>;
  campaignDetails: AdminCampaignTemplate[];
  businessName?: string;
  businessCategory?: string;
  tierConfig: TierConfig | null;
  onSave: (descriptions: Record<string, string>) => void;
  onBack: () => void;
  onJumpTo: (step: string) => void;
  isSaving: boolean;
}

export default function ReviewScreen({ template, profile, centralBusinessProfile, campaignDetails, businessName, businessCategory, tierConfig, onSave, onBack, onJumpTo, isSaving }: ReviewScreenProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() => Object.fromEntries((template.campaigns || []).map((campaign) => [campaign.key, campaign.description])));
  const rewards = template.rewards || [];
  const campaigns = template.campaigns || [];
  const formatTaxonomy = (value?: string) => value
    ? value.replace(/^(sec|cat|sub)-/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : undefined;
  const profileFields = [
    ["Industry", centralBusinessProfile ? formatTaxonomy(centralBusinessProfile.industry) : profile?.sector?.name || profile?.category?.name || businessCategory],
    ["Category", centralBusinessProfile ? formatTaxonomy(centralBusinessProfile.category) : profile?.category?.name],
    ["Subcategory", centralBusinessProfile ? formatTaxonomy(centralBusinessProfile.subCategory) : profile?.subCategory?.name],
    ["Job title", centralBusinessProfile?.jobTitle],
    ["Email", centralBusinessProfile ? centralBusinessProfile.email : profile?.email],
    ["Phone", centralBusinessProfile ? centralBusinessProfile.phone : profile?.phone],
    ["Address", [centralBusinessProfile ? centralBusinessProfile.address : profile?.address, centralBusinessProfile?.country].filter((part, index, parts) => part && !parts.slice(0, index).some((previous) => previous?.toLowerCase() === part.toLowerCase())).join(", ")],
    ["Website", centralBusinessProfile ? centralBusinessProfile.website : profile?.website],
    ["About", centralBusinessProfile ? centralBusinessProfile.description : profile?.description],
  ].filter(([, value]) => typeof value === "string" && value.trim().length > 0) as [string, string][];
  const socialLinks = (profile?.socialMedia || []).filter((item) => item.name?.trim() && item.link?.trim());

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-4 sm:px-7 sm:pb-12 sm:pt-6 lg:px-10">
        <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-orange-700"><ArrowLeft className="h-4 w-4" />Back to tiers</button>
        <section aria-label="Setup progress, step 5 of 5" className="mb-7 w-full">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-xs">
            <span>Step 5 of 5 · Final review</span><span className="text-orange-600">100% complete</span>
          </div>
          <div className="relative grid grid-cols-5">
            <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[15px] h-0.5 bg-slate-200"><div className="h-full w-full bg-orange-500" /></div>
            {["Profile", "Rewards", "Campaigns", "Tiers", "Review"].map((label, index) => {
              const number = index + 1;
              const isComplete = number < 5;
              const isCurrent = number === 5;
              return <div key={label} aria-current={isCurrent ? "step" : undefined} className={`relative z-10 flex min-w-0 flex-col items-center gap-1.5 ${isCurrent ? "text-orange-700" : "text-slate-700"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${isComplete ? "border-orange-500 bg-orange-500 text-white" : "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-100"}`}>{isComplete ? "✓" : number}</span>
                <span className="max-w-full truncate text-[10px] font-semibold sm:text-[11px]">{label}</span>
              </div>;
            })}
          </div>
        </section>
        <header className="mb-6 flex flex-col gap-2 sm:mb-8">
          <p className="w-fit rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-800">Final step · Review</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Review your setup</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Review the business details available from your profile, the rewards and campaigns you selected, and your tier settings before saving.</p>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-7">
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Programme preview</div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">Preview</span>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#14283d] via-[#0d1c2e] to-[#18283b] p-5 text-white shadow-lg sm:p-7">
                <div aria-hidden="true" className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[22px] border-white/[0.04]" />
                <div className="relative">
                  <div className="mb-8 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-lg font-bold text-white">M</span>
                    <div><p className="text-sm font-bold">MCOM Rewards</p><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">Programme preview</p></div>
                  </div>
                  {(businessName || profile?.name || businessCategory || profile?.sector?.name || profile?.category?.name) && <div className="mb-5">
                    {(businessName || profile?.name) && <><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">Business</p><p className="mt-1 truncate text-xl font-bold sm:text-2xl">{businessName || profile?.name}</p></>}
                    {(businessCategory || profile?.sector?.name || profile?.category?.name) && <p className="mt-1 text-sm text-slate-300">{businessCategory || profile?.sector?.name || profile?.category?.name}</p>}
                    <div className="mt-5 border-t border-white/15" />
                  </div>}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">Selected rewards template</p>
                  <p className="mt-1 text-base font-semibold">{template.name}</p>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <PreviewMetric label="Rewards" value={rewards.length} />
                    <PreviewMetric label="Campaigns" value={campaigns.length} />
                    <PreviewMetric label="Tiers" value={tierConfig?.enabled ? tierConfig.tiers.length : "Off"} />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">A summary of the choices in this setup. Save to finish onboarding.</p>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <ReviewSectionHeader icon={Store} title="Business profile" subtitle="Details available from your account" />
              {(profile?.banner || profile?.profileImage) && <div className="relative mb-4 flex min-h-24 items-end overflow-hidden rounded-xl bg-slate-100 p-3">
                {profile.banner && <Image src={profile.banner} alt="Business banner" fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />}
                {profile.profileImage && <div className="relative z-10 h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-white shadow"><Image src={profile.profileImage} alt={`${businessName || profile.name} logo`} fill unoptimized sizes="56px" className="object-contain p-0.5" /></div>}
              </div>}
              {(businessName || profile?.name) && <div className="mb-3 rounded-xl bg-[#eef3ff] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Business name</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{businessName || profile?.name}</p>
              </div>}
              {profileFields.length > 0 && <dl className="grid gap-3 rounded-xl bg-[#f8f9fd] p-4 sm:grid-cols-2">
                {profileFields.map(([label, value]) => <div key={label} className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
                </div>)}
              </dl>}
              {socialLinks.length > 0 && <div className="mt-3 rounded-xl bg-[#f8f9fd] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Social profiles</p>
                <div className="space-y-2">{socialLinks.map((item, index) => <div key={`${item.name}-${index}`} className="min-w-0 text-sm"><span className="font-medium text-slate-700">{item.name}: </span><span className="break-all text-slate-600">{item.link}</span></div>)}</div>
              </div>}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <ReviewSectionHeader icon={Gift} title={`Rewards · ${rewards.length}`} subtitle={template.name} onEdit={() => onJumpTo("templates")} />
              {rewards.length ? <div className="grid gap-2 sm:grid-cols-2">{rewards.map((reward) => (
                <div key={reward.id} className="flex min-w-0 items-start gap-2.5 rounded-xl bg-[#eef3ff] p-3">
                  <span className="text-lg" aria-hidden="true">{reward.image || "🎁"}</span>
                  <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{reward.name}</p><p className="mt-1 text-xs leading-5 text-slate-600">{reward.description}</p></div>
                </div>
              ))}</div> : <p className="text-sm text-slate-500">No rewards are included in this template.</p>}
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <ReviewSectionHeader icon={Megaphone} title={`Campaigns · ${campaigns.length}`} subtitle="Campaign messages" onEdit={() => onJumpTo("campaigns")} />
              {campaigns.length ? <div className="grid gap-4">{campaigns.map((campaign) => {
                const details = campaignDetails.find((item) => item.id === campaign.id || item.id === campaign.key);
                const banner = details?.banner_url || details?.bannerUrl;
                const logo = details?.logo_url || details?.logoUrl;
                const campaignType = details?.campaign_type || details?.campaignType;
                const audience = details?.audience_type || details?.audienceType;
                const attachedRewards = (campaign.includedRewardKeys || []).map((key) => rewards.find((item) => item.key === key || item.id === key)).filter((reward): reward is (typeof rewards)[number] => Boolean(reward));
                return <article key={campaign.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {(banner || logo) && <div className="relative h-32 overflow-hidden bg-slate-100">
                    {banner && <Image src={banner} alt={`${campaign.name} campaign artwork`} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />}
                    {logo && <div className="absolute bottom-3 left-3 h-14 w-14 overflow-hidden rounded-xl border border-white bg-white shadow"><Image src={logo} alt={`${campaign.name} logo`} fill unoptimized sizes="56px" className="object-contain p-0.5" /></div>}
                  </div>}
                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap gap-2">{campaignType && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">{campaignType.replaceAll("_", " ")}</span>}{audience && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800">{audience.replaceAll("_", " ")}</span>}</div>
                    <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
                    <label className="mt-3 block text-sm font-semibold text-slate-900" htmlFor={`campaign-message-${campaign.key}`}>Campaign message<FieldRequirementHint kind="important" /></label>
                    <Textarea id={`campaign-message-${campaign.key}`} value={descriptions[campaign.key] || ""} onChange={(event) => setDescriptions((current) => ({ ...current, [campaign.key]: event.target.value }))} rows={2} aria-label={`${campaign.name} message`} className="mt-3 resize-y bg-white text-sm" />
                    <div className="mt-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Attached rewards</p>
                      {attachedRewards.length ? <div className="grid gap-2 sm:grid-cols-2">{attachedRewards.map((reward) => <div key={reward.id} className="flex min-w-0 items-center gap-2 rounded-xl bg-orange-50 p-2.5">
                        <span className="text-lg" aria-hidden="true">{reward.image || "🎁"}</span><span className="min-w-0 text-xs font-medium text-orange-900">{reward.name}</span>
                      </div>)}</div> : <p className="text-xs text-slate-500">No rewards attached.</p>}
                    </div>
                  </div>
                </article>;
              })}</div> : <p className="rounded-xl bg-[#eef3ff] p-4 text-sm leading-6 text-slate-600">No campaigns are included in this setup. You can add campaigns later if they become available.</p>}
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <ReviewSectionHeader icon={Trophy} title="Customer tiers" subtitle={tierConfig?.enabled ? "Tier progression enabled" : "Tier progression off"} onEdit={() => onJumpTo("tiers")} />
              {!tierConfig?.enabled ? <p className="rounded-xl bg-[#eef3ff] p-4 text-sm text-slate-600">The tier programme is off.</p> : tierConfig.tiers.length ? <div className="space-y-2">{tierConfig.tiers.map((tier, index) => <div key={`${tier.name}-${index}`} className="flex flex-col gap-1 rounded-xl bg-[#eef3ff] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-slate-900">{tier.name}</span><span className="text-sm text-slate-600">{tier.requirementValue} {tier.requirementType} · {tier.benefits.join(", ") || "No benefits listed"}</span></div>)}</div> : <p className="rounded-xl bg-[#eef3ff] p-4 text-sm text-slate-600">No tiers are configured.</p>}
            </Card>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 pt-2">
          <Button size="lg" disabled={isSaving} onClick={() => onSave(descriptions)} className="h-12 min-w-[250px] rounded-xl bg-orange-600 px-8 font-semibold text-white shadow-[0_8px_18px_rgba(255,91,0,0.18)] hover:bg-orange-700 sm:h-14 sm:min-w-[300px]">
            {isSaving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving setup…</> : <><CheckCircle className="mr-2 h-5 w-5" />Save setup and go to dashboard</>}
          </Button>
          <p className="text-center text-xs text-slate-500">Save your setup to complete onboarding.</p>
        </div>
      </div>
    </main>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/10 px-2.5 py-2.5"><p className="text-[10px] text-slate-300">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>;
}

function ReviewSectionHeader({ icon: Icon, title, subtitle, onEdit }: { icon: LucideIcon; title: string; subtitle?: string; onEdit?: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Icon className="h-4 w-4" /></span><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{title}</h2>{subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>}</div></div>
      {onEdit && <button onClick={onEdit} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50"><Pencil className="h-3.5 w-3.5" />Edit</button>}
    </div>
  );
}
