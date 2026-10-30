"use client";

import Image from "next/image";
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    title: "Retain your customers",
    description: "Build lasting relationships with rewards that give customers a reason to return.",
    image: "/retain.png",
    alt: "Customer retention illustration",
    detail: "Stronger customer relationships",
  },
  {
    title: "Increase repeat purchases",
    description: "Bring points, stamps, and personalised offers together in one simple programme.",
    image: "/repeat.png",
    alt: "Repeat purchase rewards illustration",
    detail: "Points · stamps · offers",
  },
  {
    title: "Grow customer value",
    description: "Encourage higher spend with tiers, gift cards, and campaigns for your business.",
    image: "/growth.png",
    alt: "Business growth illustration",
    detail: "Tiers and targeted campaigns",
  },
  {
    title: "Simple to set up",
    description: "Start with a programme suited to your business, then make it your own.",
    image: "/automated.png",
    alt: "Automated rewards illustration",
    detail: "Ready in just a few minutes",
  },
];

interface WelcomeScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function WelcomeScreen({ onComplete, onSkip }: WelcomeScreenProps) {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <div className="flex min-h-screen w-full flex-col px-5 pb-3 pt-2 sm:px-8 sm:pt-4 lg:px-12 2xl:px-16">
        <section className="mx-auto w-full flex-1 py-2 sm:w-[90%] sm:py-3 lg:w-[70%] lg:py-4">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-6">
            <div className="max-w-none">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 sm:text-sm">Customer rewards, made simple</p>
              <h1 className="text-2xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                Welcome to <span className="text-orange-600">MCOM Rewards</span>
              </h1>
              <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-600 sm:text-base sm:leading-7">
                Bring customers back with points, stamps, rewards, and campaigns tailored to your business. Your business details are ready; let&apos;s shape your programme.
              </p>
            </div>
            <div className="hidden shrink-0 pb-1 text-sm font-medium text-slate-500 lg:block">A better way to reward repeat business</div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:gap-5">
            {BENEFITS.map((benefit, index) => (
              <article key={benefit.title} className="group grid min-h-40 grid-cols-[36%_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.09)] sm:min-h-44">
                <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-orange-50 via-[#fff8f0] to-amber-50">
                  <div className="absolute -right-9 -top-14 h-48 w-48 rounded-full border-[24px] border-white/45" />
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/40 to-transparent" />
                  <Image src={benefit.image} alt={benefit.alt} fill sizes="(max-width: 639px) 38vw, (max-width: 1279px) 19vw, 14vw" className="z-10 object-contain p-2" />
                  <span className="absolute left-3 top-3 z-20 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold tracking-[0.12em] text-orange-700 shadow-sm sm:left-4 sm:top-4">0{index + 1}</span>
                </div>
                <div className="flex flex-col justify-center p-3 sm:p-4 lg:p-5">
                  <h2 className="text-base font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg">{benefit.title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">{benefit.description}</p>
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 text-xs font-semibold text-slate-600 sm:text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden="true" />
                    <span>{benefit.detail}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-2 sm:mt-9 sm:flex-row sm:justify-center">
            <Button onClick={onComplete} className="h-12 w-full rounded-xl bg-orange-600 px-8 text-base font-semibold text-white shadow-sm hover:bg-orange-700 sm:w-auto sm:min-w-52">
              Start setup <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button onClick={onSkip} className="h-11 px-5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              Skip for now
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:mt-4">
            <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" />Secure setup</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />No credit card required</span>
          </div>
        </section>
      </div>
    </main>
  );
}
