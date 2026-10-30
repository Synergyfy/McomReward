"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CircleHelp, Clock3, Globe, Mail, MapPin, Phone, Store, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetBusinessProfile } from "@/services/business/hook";
import { formTypography } from "./formTypography";
import SetupProgress from "./SetupProgress";

interface ProfileScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

function ProfileFieldInfo({ label, imported }: { label: string; imported: boolean }) {
  const message = imported
    ? "Imported from your CHS dashboard."
    : `Go to your CHS dashboard and fill in your ${label} so MCOM Rewards can pull it here.`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={imported ? `${label} imported from CHS` : `${label} is missing`} className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 ${imported ? "text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500" : "text-orange-600 hover:bg-orange-50 focus-visible:ring-orange-500"}`}>
          <CircleHelp className="h-[11px] w-[11px]" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-auto max-w-[min(18rem,calc(100vw-2rem))] px-2 py-1 text-[10px] leading-4 text-slate-700">
        {message}
      </PopoverContent>
    </Popover>
  );
}

export default function ProfileScreen({ onComplete, onBack }: ProfileScreenProps) {
  const { data: profile } = useGetBusinessProfile();
  const [centralProfile, setCentralProfile] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mcom_central_business_profile");
      if (stored) setCentralProfile(JSON.parse(stored));
    } catch {
      setCentralProfile(null);
    }
  }, []);

  const formatTaxonomy = (value?: string) => value
    ? value.replace(/^(sec|cat|sub)-/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";
  const industryName = centralProfile
    ? formatTaxonomy(centralProfile.industry) || "Not set"
    : profile?.sector?.name || profile?.category?.name || "Business";
  const categoryName = centralProfile
    ? formatTaxonomy(centralProfile.category)
    : profile?.category?.name || "";
  const isImportedFromChs = (centralValue: string | undefined, localValue: string | undefined) => {
    const value = centralProfile ? centralValue : profile?.mcomUserId ? localValue : undefined;
    const normalized = value?.trim().toLowerCase();
    return Boolean(normalized && !["not set", "not specified", "null", "undefined"].includes(normalized));
  };
  const centralBusinessName = centralProfile?.businessName || centralProfile?.name;
  const businessName = centralProfile
    ? centralBusinessName || "Your Business"
    : profile?.name || "Your Business";
  const businessNameImported = isImportedFromChs(centralBusinessName, profile?.name);
  const profileValue = (centralValue: string | undefined, localValue: string | undefined) =>
    centralProfile ? centralValue || "" : localValue || "";

  const renderValue = (label: string, value: string, field: "address" | "phone" | "website" | "category" | "email", imported: boolean) => {
    const Icon = field === "address" ? MapPin : field === "phone" ? Phone : field === "category" ? Tags : field === "email" ? Mail : Globe;
    return (
        <div key={field} className="flex min-w-0 items-center gap-3 rounded-xl bg-[#f5f7fc] px-3 py-1 sm:gap-3.5 sm:px-3.5 sm:py-1.5 max-sm:gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffded0] text-[#ff4b0a] max-sm:h-9 max-sm:w-9 sm:h-12 sm:w-12"><Icon className="h-[18px] w-[18px] max-sm:h-[14px] max-sm:w-[14px]" /></span>
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] ${formTypography.label}`}>{label}</p>
          <p className={`truncate text-[13px] text-slate-600 sm:text-[13px] ${formTypography.value}`}>{value || "Not set"}</p>
        </div>
        <ProfileFieldInfo label={label.toLowerCase()} imported={imported} />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <div className="mx-auto flex min-h-screen w-full flex-col px-4 pb-6 pt-4 max-sm:min-h-dvh max-sm:overflow-visible max-sm:px-4 max-sm:pb-3 max-sm:pt-3 sm:px-7 lg:w-[75vw] lg:max-w-[1600px] lg:px-0 lg:pb-4 lg:pt-3">
        <button onClick={onBack} className="mb-4 inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-orange-700 max-sm:mb-3 max-sm:py-1.5"><ArrowLeft className="h-4 w-4" />Back</button>
        <section className="flex min-h-0 flex-1 items-center py-2 max-sm:flex-none max-sm:items-start max-sm:overflow-visible max-sm:py-0">
          <div className="grid min-h-0 w-full items-stretch gap-3 max-sm:h-auto max-sm:min-h-0 max-sm:content-start max-sm:gap-2 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-12">
          <div className="flex min-w-0 flex-col">
            <div className="mb-4 hidden items-center gap-2 self-start rounded-full bg-[#e7edff] px-3 py-1.5 text-[9px] font-bold tracking-[0.1em] text-slate-600 sm:text-[11px] lg:inline-flex"><span className="text-orange-600">✣</span>MCOM REWARDS</div>
            <SetupProgress currentStep={1} className="mb-0 max-w-2xl lg:mb-7 max-sm:mb-2" />
            <h1 className="mt-5 hidden max-w-3xl text-[27px] font-semibold leading-tight tracking-[-0.04em] text-slate-950 lg:mt-0 lg:block sm:text-[32px] xl:text-[40px]">Verify Your Business Identity</h1>
            <p className="mt-3 hidden max-w-3xl text-[14px] leading-6 text-slate-600 lg:block sm:text-[16px] sm:leading-7">We&apos;ve synchronized your verified profile from <strong className="font-semibold text-slate-900">Central Hub Solution.</strong> Review your public merchant credentials or update them in real time.</p>

            <div className="relative mx-auto mt-8 hidden w-full max-w-[432px] px-1 sm:mt-10 lg:mb-4 lg:mt-auto lg:block lg:-translate-y-[20%] lg:pt-8">
              <div className="relative aspect-[16/10] w-full">
                <Image src="/step2.png" alt="Business identity verification" fill priority sizes="(max-width: 1024px) 100vw, 34vw" className="scale-[1.35] object-contain" />
              </div>
            </div>

          </div>

          <section className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.08)] max-sm:min-h-0 max-sm:overflow-visible max-sm:rounded-2xl max-sm:p-3 sm:p-5 lg:p-5 xl:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-sm:gap-3">
              <div className="min-w-0"><h2 className="text-xl font-semibold tracking-tight text-slate-950 max-sm:text-base sm:text-[27px]">Confirm Your Profile</h2><p className="mt-1 max-w-lg text-[13px] leading-5 text-slate-600 max-sm:text-xs max-sm:leading-4 sm:text-[14px]">We&apos;ve pulled your information from Central Hub Solution. Review and continue.</p></div>
            </div>

            <div className="mb-4 mt-3 border-t border-blue-100 pt-3 max-sm:mb-2 max-sm:mt-2 max-sm:pt-2 sm:mb-5 sm:mt-2"><h3 className={`text-[14px] font-semibold text-slate-900 sm:text-[15px] ${formTypography.section}`}>Business Information</h3></div>

            <div className="space-y-2 sm:space-y-2.5 max-sm:space-y-1.5">
              <div className="flex items-center gap-3 rounded-xl bg-[#f5f7fc] px-3 py-1.5 sm:gap-3.5 sm:px-3.5 sm:py-2 max-sm:gap-2.5 max-sm:py-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffded0] text-[#ff4b0a] max-sm:h-9 max-sm:w-9 sm:h-11 sm:w-11"><Store className="h-4 w-4 max-sm:h-3 max-sm:w-3" /></span>
                <div className="min-w-0 flex-1"><p className={`text-[13px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[15px] ${formTypography.label}`}>Business Name</p><p className={`truncate text-xs font-semibold text-slate-950 sm:text-[14px] ${formTypography.value}`}>{businessName}</p></div>
                <ProfileFieldInfo label="business name" imported={businessNameImported} />
              </div>
              {(centralProfile?.jobTitle || centralProfile?.description) && <div className="rounded-xl bg-[#f5f7fc] px-3 py-2.5 sm:px-3.5">
                {centralProfile?.jobTitle && <p className="text-[11px] font-semibold text-slate-800 sm:text-[13px]">{centralProfile?.jobTitle}</p>}
                {centralProfile?.description && <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-600 sm:text-[12px]">{centralProfile?.description}</p>}
              </div>}
              <div className="flex items-center gap-3 rounded-xl bg-[#f5f7fc] px-3 py-1.5 sm:gap-3.5 sm:px-3.5 sm:py-2 max-sm:gap-2.5 max-sm:py-1"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffded0] text-[#ff4b0a] max-sm:h-9 max-sm:w-9 sm:h-11 sm:w-11"><Tags className="h-4 w-4 max-sm:h-3 max-sm:w-3" /></span><div className="min-w-0 flex-1"><p className={`text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] ${formTypography.label}`}>Industry</p><p className={`truncate text-[13px] text-slate-900 sm:text-[13px] ${formTypography.value}`}>{industryName}</p></div><ProfileFieldInfo label="industry" imported /></div>
              {categoryName && renderValue("Category", categoryName, "category", isImportedFromChs(centralProfile?.category, profile?.category?.name))}
              {renderValue("Email", profileValue(centralProfile?.email, profile?.email), "email", isImportedFromChs(centralProfile?.email, profile?.email))}
              {renderValue("Address", [profileValue(centralProfile?.address, profile?.address), centralProfile?.country].filter((part, index, parts) => part && !parts.slice(0, index).some((previous) => previous?.toLowerCase() === part.toLowerCase())).join(", "), "address", isImportedFromChs(centralProfile?.address || centralProfile?.country, profile?.address))}
              {renderValue("Phone", profileValue(centralProfile?.phone, profile?.phone), "phone", isImportedFromChs(centralProfile?.phone, profile?.phone))}
              {renderValue("Website", profileValue(centralProfile?.website, profile?.website), "website", isImportedFromChs(centralProfile?.website, profile?.website))}
            </div>

            <Button size="lg" onClick={onComplete} className="mt-4 h-11 w-full rounded-xl bg-orange-600 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(255,91,0,0.2)] hover:bg-orange-700 max-sm:mt-3 sm:mt-5 sm:h-12 sm:text-[14px]">
              Continue<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-3 text-center text-xs text-slate-600 max-sm:mt-1.5 max-sm:text-[11px] sm:text-sm"><Clock3 className="mr-1 inline h-4 w-4 text-blue-600" />You can update these details anytime in Account Settings.</p>
          </section>
          </div>
        </section>

      </div>
    </main>
  );
}
