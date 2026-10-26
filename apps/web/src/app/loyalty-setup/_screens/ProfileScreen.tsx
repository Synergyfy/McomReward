"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Globe, Mail, MapPin, Phone, ShieldCheck, Store, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetBusinessProfile } from "@/services/business/hook";

interface ProfileScreenProps {
  onComplete: () => void;
  onBack: () => void;
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
  const businessName = centralProfile
    ? centralProfile.businessName || "Your Business"
    : profile?.name || "Your Business";
  const profileValue = (centralValue: string | undefined, localValue: string | undefined) =>
    centralProfile ? centralValue || "" : localValue || "";
  const profileNameImportedFromChs = Boolean(centralProfile || profile?.mcomUserId);

  const renderValue = (label: string, value: string, field: "address" | "phone" | "website" | "category" | "email") => {
    const Icon = field === "address" ? MapPin : field === "phone" ? Phone : field === "category" ? Tags : field === "email" ? Mail : Globe;
    return (
      <div key={field} className="flex min-w-0 items-center gap-3 rounded-xl bg-[#f5f7fc] px-3 py-1 sm:gap-3.5 sm:px-3.5 sm:py-1.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffded0] text-[#ff4b0a] sm:h-12 sm:w-12"><Icon className="h-[18px] w-[18px]" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[10px]">{label}</p>
          <p className="truncate text-[11px] text-slate-600 sm:text-[13px]">{value || "Not set"}</p>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-900" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <div className="mx-auto flex min-h-screen w-full flex-col px-4 pb-6 pt-4 sm:px-7 lg:w-[75vw] lg:max-w-[1600px] lg:px-0 lg:pb-4 lg:pt-3">
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-orange-700"><ArrowLeft className="h-4 w-4" />Back</button>
        <section className="flex flex-1 items-center py-2">
          <div className="grid w-full items-stretch gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-12">
          <div className="flex min-w-0 flex-col">
            <div className="mb-4 hidden items-center gap-2 self-start rounded-full bg-[#e7edff] px-3 py-1.5 text-[9px] font-bold tracking-[0.1em] text-slate-600 sm:text-[11px] lg:inline-flex"><span className="text-orange-600">✣</span>MCOM REWARDS</div>
            <div aria-label="Setup progress, step 1 of 5" className="mb-0 w-full max-w-2xl lg:mb-7">
              <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[13px]"><span>Step 1 of 5 · Profile</span><span className="text-orange-600">20%</span></div>
              <div className="relative grid grid-cols-5">
                <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[14px] h-0.5 bg-slate-200" />
                {[
                  { label: "Profile", current: true },
                  { label: "Rewards", current: false },
                  { label: "Campaigns", current: false },
                  { label: "Tiers", current: false },
                  { label: "Review", current: false },
                ].map((item, index) => (
                  <div key={item.label} className={`relative z-10 flex min-w-0 flex-col items-center gap-2 ${item.current ? "text-orange-700" : "text-slate-400"}`}>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white text-[14px] font-bold ${item.current ? "border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-100" : "border-slate-300 text-slate-500"}`}>{index + 1}</span>
                    <span className="max-w-full truncate text-[9px] font-semibold sm:text-[11px]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <h1 className="mt-5 hidden max-w-3xl text-[27px] font-semibold leading-tight tracking-[-0.04em] text-slate-950 lg:mt-0 lg:block sm:text-[32px] xl:text-[40px]">Verify Your Business Identity</h1>
            <p className="mt-3 hidden max-w-3xl text-[14px] leading-6 text-slate-600 lg:block sm:text-[16px] sm:leading-7">We&apos;ve synchronized your verified profile from <strong className="font-semibold text-slate-900">Central Hub Solution.</strong> Review your public merchant credentials or update them in real time.</p>

            <div className="relative mx-auto mt-8 hidden w-full max-w-[432px] px-1 sm:mt-10 lg:mb-4 lg:mt-auto lg:block lg:-translate-y-[20%] lg:pt-8">
              <div className="relative aspect-[16/10] w-full">
                <Image src="/step2.png" alt="Business identity verification" fill priority sizes="(max-width: 1024px) 100vw, 34vw" className="scale-[1.35] object-contain" />
              </div>
            </div>

          </div>

          <section className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.08)] sm:p-5 lg:p-5 xl:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0"><h2 className="text-[22px] font-semibold tracking-tight text-slate-950 sm:text-[27px]">Confirm Your Profile</h2><p className="mt-1 max-w-lg text-[12px] leading-5 text-slate-600 sm:text-[14px]">We&apos;ve pulled your information from Central Hub Solution. Review and continue.</p></div>
            </div>

            <div className="mb-4 mt-3 border-t border-blue-100 pt-3 sm:mb-5 sm:mt-2"><h3 className="text-[14px] font-semibold text-slate-900 sm:text-[15px]">Business Information</h3></div>

            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl bg-[#f5f7fc] px-3 py-1.5 sm:gap-3.5 sm:px-3.5 sm:py-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffded0] text-[#ff4b0a] sm:h-11 sm:w-11"><Store className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[10px]">Business Name</p><div className="flex min-w-0 items-center gap-2"><p className="truncate text-[13px] font-semibold text-slate-950 sm:text-[15px]">{businessName}</p>{profileNameImportedFromChs && <span className="shrink-0 rounded-md bg-blue-100 px-2 py-1 text-[8px] font-semibold text-blue-800">Imported</span>}</div></div>
                <ShieldCheck className="h-5 w-5 shrink-0 text-orange-600" />
              </div>
              {(centralProfile?.jobTitle || centralProfile?.description) && <div className="rounded-xl bg-[#f5f7fc] px-3 py-2.5 sm:px-3.5">
                {centralProfile?.jobTitle && <p className="text-[11px] font-semibold text-slate-800 sm:text-[13px]">{centralProfile?.jobTitle}</p>}
                {centralProfile?.description && <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-600 sm:text-[12px]">{centralProfile?.description}</p>}
              </div>}
              <div className="flex items-center gap-3 rounded-xl bg-[#f5f7fc] px-3 py-1.5 sm:gap-3.5 sm:px-3.5 sm:py-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffded0] text-[#ff4b0a] sm:h-11 sm:w-11"><Tags className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:text-[10px]">Industry</p><p className="truncate text-[12px] text-slate-900 sm:text-[13px]">{industryName}</p></div>{profileNameImportedFromChs && <span className="shrink-0 rounded-md bg-blue-100 px-2 py-1 text-[8px] font-semibold text-blue-800">Imported</span>}</div>
              {categoryName && renderValue("Category", categoryName, "category")}
              {renderValue("Email", profileValue(centralProfile?.email, profile?.email), "email")}
              {renderValue("Address", [profileValue(centralProfile?.address, profile?.address), centralProfile?.country].filter((part, index, parts) => part && !parts.slice(0, index).some((previous) => previous?.toLowerCase() === part.toLowerCase())).join(", "), "address")}
              {renderValue("Phone", profileValue(centralProfile?.phone, profile?.phone), "phone")}
              {renderValue("Website", profileValue(centralProfile?.website, profile?.website), "website")}
            </div>

            <Button size="lg" onClick={onComplete} className="mt-4 h-11 w-full rounded-xl bg-orange-600 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(255,91,0,0.2)] hover:bg-orange-700 sm:mt-5 sm:h-12 sm:text-[14px]">
              Continue<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-3 text-center text-xs text-slate-600 sm:text-sm"><Clock3 className="mr-1 inline h-4 w-4 text-blue-600" />You can update these details anytime in Account Settings.</p>
          </section>
          </div>
        </section>

      </div>
    </main>
  );
}
