"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCentralLoginUrl } from "@/lib/sso-utils";
import { setSsoState } from "@/lib/auth-cookies";

function LoginForm() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const [isLoading, setIsLoading] = useState(false);

  const handleSsoLogin = () => {
    setIsLoading(true);
    try {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const state = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
      setSsoState(state);

      const authorizeUrl = getCentralLoginUrl("/auth/callback", state);
      window.location.href = authorizeUrl;
    } catch {
      toast.error("Failed to initiate SSO login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-x-clip bg-[#f7f9fc] px-3 py-4 text-slate-800 sm:px-5 sm:py-6 md:px-8 lg:min-h-screen lg:px-10 lg:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-28 h-[520px] w-[520px] rounded-full bg-orange-100/60 blur-[100px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 sm:gap-8 lg:flex-row lg:justify-between lg:gap-12">
        <section className="hidden min-w-0 flex-1 flex-col justify-center items-start lg:flex lg:pr-6">
          <div className="mb-5 flex items-center gap-4 text-[40px] font-bold tracking-tight text-orange-600">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_6px_12px_rgba(249,84,0,0.2)]"><CreditCard size={27} strokeWidth={2.3} /></span>
            <span>MCOM Rewards</span>
          </div>
          <div className="mb-7 h-1.5 w-20 rounded-full bg-orange-500" />
          <h1 className="max-w-[650px] text-[44px] font-bold leading-[1.12] tracking-tight text-slate-950">
            Welcome back.<br /><span className="text-orange-600">Your rewards are waiting.</span>
          </h1>
          <p className="mt-5 max-w-[590px] text-[21px] leading-relaxed text-slate-600">
            Sign in to pick up where you left off with your loyalty cards, local offers, and MCOM rewards.
          </p>
          <div className="relative mt-7 w-full max-w-[650px]">
            <Image src="/login-img.png" alt="MCOM Rewards, gift vouchers, and digital loyalty cards" width={669} height={373} priority className="h-auto w-full object-contain" />
            <div className="absolute bottom-2 left-5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm text-slate-700 shadow-md">
              <ShieldCheck size={17} className="text-orange-600" /> One account <span className="text-slate-300">•</span> Your rewards, connected
            </div>
          </div>
        </section>

        <section className="w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-[0_18px_55px_rgba(15,23,42,0.12)] sm:rounded-[28px] sm:px-10 sm:py-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_6px_12px_rgba(249,84,0,0.2)] lg:hidden">
              <CreditCard size={24} strokeWidth={2.2} />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Your MCOM Rewards account</p>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[30px]">Welcome Back</h2>
            <p className="mt-2 text-[15px] leading-6 text-slate-500">Log in to manage your account</p>
          </div>

          <Button
            type="button"
            onClick={handleSsoLogin}
            className="min-h-12 h-auto w-full cursor-pointer whitespace-normal rounded-xl bg-orange-500 px-3 py-3 text-center text-sm font-semibold leading-5 text-white shadow-[0_8px_18px_rgba(249,84,0,0.18)] hover:bg-orange-600 sm:h-12 sm:whitespace-nowrap sm:px-4 sm:py-2 sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting to Central Hub Solution...</> : "Login with Central Hub Solution"}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <a href={campaignId ? `/signup?campaignId=${campaignId}&type=customer` : "/signup"} className="font-semibold text-orange-600 hover:underline">
              Sign up
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
