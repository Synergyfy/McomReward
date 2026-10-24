"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, CreditCard, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { getCentralCustomerSignupUrl, getCentralBusinessSignupUrl } from "@/lib/sso-utils";

interface SignupClientProps {
  provisionCode?: string;
}

function SignupCard() {
  const handleCustomerSignup = () => {
    window.location.href = getCentralCustomerSignupUrl();
  };

  const handleBusinessSignup = () => {
    window.location.href = getCentralBusinessSignupUrl();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_18px_55px_rgba(15,23,42,0.12)] sm:rounded-[28px]"
    >
      <header className="border-b border-slate-100 px-5 py-6 text-center sm:px-8 sm:py-7">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_6px_12px_rgba(249,84,0,0.2)] lg:hidden">
          <CreditCard size={24} strokeWidth={2.2} />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Join MCOM Rewards</p>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[27px]">Create your account</h1>
        <p className="mt-2 text-[15px] text-slate-500">Choose how you want to join MCOM Rewards</p>
      </header>

      <div className="px-5 py-6 sm:px-8 sm:py-9">
        <div className="mb-7 text-center">
          <h2 className="text-xl font-semibold text-slate-950">Get Started</h2>
          <p className="mt-2 text-sm text-slate-500">Select your role below to begin your journey</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleCustomerSignup}
            className="flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-[0_8px_18px_rgba(249,84,0,0.18)] transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            <User size={20} />
            Sign up as Customer
          </button>

          <button
            type="button"
            onClick={handleBusinessSignup}
            className="flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:border-orange-300 hover:bg-orange-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            <Building2 size={20} />
            Sign up as Business
          </button>
        </div>
      </div>

      <footer className="space-y-3 border-t border-slate-100 bg-white px-4 py-5 text-center sm:px-5 sm:py-6">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">Log in</Link>
        </p>
        <p className="mx-auto max-w-sm text-xs text-slate-400">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
        </p>
      </footer>
    </motion.section>
  );
}

export default function SignupClient({ provisionCode }: SignupClientProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-x-clip bg-[#f7f9fc] px-3 py-4 text-slate-800 sm:px-5 sm:py-6 md:px-8 lg:min-h-screen lg:px-10 lg:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 -top-28 h-[520px] w-[520px] rounded-full bg-orange-100/60 blur-[100px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 sm:gap-8 lg:flex-row lg:justify-between lg:gap-12">
        <section className="hidden min-w-0 flex-1 flex-col justify-center items-start lg:flex lg:pr-6">
          <div className="mb-5 flex items-center gap-4 text-[40px] font-bold tracking-tight text-orange-600">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_6px_12px_rgba(249,84,0,0.2)]"><CreditCard size={27} strokeWidth={2.3} /></span>
            <span>MCOM Rewards</span>
          </div>
          <div className="mb-7 h-1.5 w-20 rounded-full bg-orange-500" />
          <h2 className="max-w-[650px] text-[44px] font-bold leading-[1.12] tracking-tight text-slate-950">
            Rewards that bring<br /><span className="text-orange-600">people and businesses closer.</span>
          </h2>
          <p className="mt-5 max-w-[590px] text-[21px] leading-relaxed text-slate-600">
            Earn rewards, grow loyalty, and connect smarter. Join as a customer or business.
          </p>
          <div className="relative mt-7 w-full max-w-[650px]">
            <Image src="/signup-img.png" alt="MCOM Rewards loyalty points, member card, and local business" width={669} height={373} priority className="h-auto w-full object-contain" />
            <div className="absolute bottom-2 left-5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm text-slate-700 shadow-md">
              <ShieldCheck size={17} className="text-orange-600" /> One account <span className="text-slate-300">•</span> Connected rewards
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="min-h-[420px] w-full max-w-[500px] animate-pulse rounded-2xl bg-slate-100 sm:min-h-[440px] sm:rounded-[28px]" />}>
          <SignupCard />
        </Suspense>
      </div>
    </main>
  );
}
