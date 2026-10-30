"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Building2, Gift, Sparkles, Trophy, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useGetPublicCampaigns } from "@/services/customer-campaigns/hook";

const tiers = [
  { name: "Bronze", color: "text-[#b96b30]", bg: "bg-[#b96b30]/10", benefits: "Standard rewards access. Scan to earn." },
  { name: "Silver", color: "text-slate-500", bg: "bg-slate-300/40", benefits: "5% Bonus Points. Member support queue." },
  { name: "Gold", color: "text-amber-500", bg: "bg-amber-400/20", benefits: "10% Bonus. Exclusive local partner access." },
  { name: "Platinum", color: "text-orange-500", bg: "bg-orange-500/10", benefits: "VIP early event access. Custom brand details." },
];

const journey = [
  { title: "Join", description: "Create your free digital profile.", icon: "person_add" },
  { title: "Earn", description: "Shop at partner brands.", icon: "shopping_cart" },
  { title: "Collect", description: "Keep points in your wallet.", icon: "account_balance_wallet" },
  { title: "Redeem", description: "Swap points for vouchers.", icon: "redeem" },
  { title: "Enjoy", description: "Experience the real value.", icon: "celebration" },
];

export default function Homepage() {
  const { data: campaignsData } = useGetPublicCampaigns(1, 12);
  const campaigns = useMemo(() => campaignsData?.data ?? [], [campaignsData]);
  const spotlight = useMemo(() => campaigns.slice(0, 2), [campaigns]);

  return (
    <div className="overflow-hidden bg-[#f8f9fb] text-slate-900">
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-orange-100/70 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:px-10 lg:pb-20 lg:pt-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700 shadow-sm sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> New Discovery Engine
            </span>
            <h1 className="mt-5 font-headline-lg text-[2.6rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.65rem] xl:text-[4.15rem]">
              Earn more from the <span className="text-orange-600">brands and businesses</span> you already use.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Get rewards, gift cards, loyalty points, cashback, and exclusive local offers seamlessly delivered to your MCOM wallet.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/reward" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                Explore Rewards
              </Link>
              <Link href="/business" className="inline-flex min-h-11 items-center justify-center gap-1 px-2 text-sm font-bold text-orange-700 transition hover:text-orange-800">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> One wallet for your rewards</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500" /> Local offers and global brands</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
            <div className="relative aspect-[1.28/1] overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-[#fff5eb] via-white to-[#fff0e4] shadow-[0_24px_70px_rgba(74,42,20,0.10)] sm:rounded-[2.5rem]">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-56 w-56 rounded-full border-[28px] border-white/70 sm:h-72 sm:w-72" />
              <div aria-hidden="true" className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-orange-200/35 blur-2xl" />
              <Image src="/signup-img.png" alt="MCOM digital rewards pass and partner storefront" fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="relative z-10 object-contain p-3 sm:p-7 lg:p-4 xl:p-7" />
              <div className="absolute left-4 top-4 z-20 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur sm:left-6 sm:top-6 sm:px-4 sm:py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Your rewards</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Wallet className="h-4 w-4 text-orange-600" /> All in one wallet</p>
              </div>
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg sm:bottom-6 sm:right-6 sm:px-4 sm:py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700"><Gift className="h-4 w-4" /></span>
                <div><p className="text-xs font-bold text-slate-900">Earn. Collect. Enjoy.</p><p className="text-[10px] text-slate-500">Rewards for everyday moments</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-7 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">Discover more value</p>
              <h2 className="mt-2 font-headline-lg text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Discovery Hub</h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">Exclusive local perks and trending global rewards.</p>
            </div>
            <Link href="/reward" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-800">
              View All Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {spotlight.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center sm:col-span-2 sm:flex-row sm:gap-5 sm:text-left">
                <div className="relative h-28 w-44 shrink-0 sm:h-36 sm:w-52">
                  <Image src="/login-img.png" alt="MCOM rewards wallet with a gift voucher" fill sizes="(max-width: 640px) 176px, 208px" className="object-contain" />
                </div>
                <div className="max-w-sm">
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">Discovery updates</span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">New offers are on the way</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">No live campaigns yet. Check back soon for rewards from MCOM businesses.</p>
                </div>
              </div>
            ) : spotlight.map((campaign) => (
              <Link key={campaign.id} href={`/merchants/${campaign.id}`} className="group relative flex min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                {campaign.bannerUrl ? <Image src={campaign.bannerUrl} alt="" fill unoptimized sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-800" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="relative z-10 mt-auto p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-200">{campaign.business?.name ?? "Local business"}</p>
                  <h3 className="mt-1 text-lg font-bold leading-snug">{campaign.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/80">{campaign.campaignMessage || "Explore this local reward."}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white">Explore offer <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            ))}

            <Link href="/matching-rewards" className="group flex min-h-[220px] items-center gap-3 overflow-hidden rounded-3xl border border-orange-100 bg-[#fff8f1] p-4 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:gap-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-orange-700"><BadgePercent className="h-3 w-3" /> Cashback</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Cashback</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">Earn digital credit back on everyday retail purchases.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-700">Explore offers <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
              </div>
              <div className="relative h-28 w-24 shrink-0 sm:h-36 sm:w-28"><Image src="/repeat.png" alt="Shopping bags and reward coins" fill sizes="112px" className="object-contain transition duration-300 group-hover:scale-105" /></div>
            </Link>

            <Link href="/reward" className="group flex min-h-[220px] items-center gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:gap-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-orange-700"><Trophy className="h-3 w-3" /> MCOM Rewards</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Loyalty Rewards</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">Unlock stamps, custom merchant tiers, and lifestyle rewards.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-700">View rewards <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
              </div>
              <div className="relative h-28 w-24 shrink-0 sm:h-36 sm:w-28"><Image src="/growth.png" alt="Growing reward points" fill sizes="112px" className="object-contain transition duration-300 group-hover:scale-105" /></div>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">Five simple steps</span>
            <h2 className="mt-3 font-headline-lg text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">The MCOM Journey</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">A simple way to get more from the places you already shop.</p>
          </div>

          <div className="relative mt-9 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-5 lg:gap-5">
            <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-orange-400 via-orange-200 to-slate-200 lg:block" />
            {journey.map((item, index) => (
              <div key={item.title} className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-col lg:border-0 lg:bg-transparent lg:p-2 lg:text-center lg:shadow-none">
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${index === 0 ? "border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "border-orange-100 bg-white text-orange-600 shadow-sm"}`}>
                  <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
                </div>
                <div className="min-w-0 lg:mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700">0{index + 1} · {item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:mt-12">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/15"><Building2 className="h-5 w-5" /></span>
              <div><h3 className="font-bold text-slate-900 sm:text-lg">Are you a business? Get discovered.</h3><p className="mt-1 text-sm leading-5 text-slate-600">Reach local customers, run stamp campaigns, and build repeat business.</p></div>
            </div>
            <Link href="/business" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700">Join as a business <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">More ways to enjoy MCOM</p>
            <h2 className="mt-2 font-headline-lg text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Unlock Tier Status</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Unlock larger benefits as you engage with the rewards community.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {tiers.map((tier) => (
              <div key={tier.name} className={`relative flex min-h-[170px] flex-col items-center rounded-2xl border bg-white px-3 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:min-h-[190px] sm:px-5 sm:py-6 ${tier.name === "Gold" ? "border-orange-400 ring-1 ring-orange-200 shadow-orange-100" : "border-slate-200"}`}>
                {tier.name === "Gold" && <span className="absolute -top-2.5 rounded-full bg-orange-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">Popular</span>}
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tier.bg}`}><Trophy className={`h-5 w-5 ${tier.color}`} /></span>
                <h3 className="mt-3 font-bold text-slate-900 sm:text-lg">{tier.name}</h3>
                <p className="mt-1 max-w-[14rem] text-[11px] leading-5 text-slate-500 sm:text-xs">{tier.benefits}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-2 md:gap-5 lg:px-10">
          <article className="relative flex min-h-[250px] flex-col items-start justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#172337] to-[#0c1422] p-6 text-white shadow-lg sm:min-h-[290px] sm:p-8">
            <div aria-hidden="true" className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[28px] border-white/[0.05]" />
            <div className="relative z-10">
              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-300">MCOM Play</span>
              <h2 className="mt-4 font-headline-lg text-2xl font-bold sm:text-3xl">Play &amp; Win Rewards</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/70">Spin the Wheel, Peg-Drop, or try Scratch Cards to unlock daily points.</p>
            </div>
            <Link href="/play-win" className="relative z-10 mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-500">Play Games Now <ArrowRight className="h-4 w-4" /></Link>
            <div className="absolute -bottom-5 right-0 h-40 w-40 opacity-20 sm:h-52 sm:w-52"><Image src="/automated.png" alt="" fill sizes="208px" className="object-contain" /></div>
          </article>

          <article className="flex min-h-[250px] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:min-h-[290px] sm:p-8">
            <div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Coming soon</span>
              <h2 className="mt-4 font-headline-lg text-2xl font-bold text-slate-950 sm:text-3xl">MCOM Rewards Expo</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">Gather with local businesses, complete offline quests, claim ticket rewards, and meet the community.</p>
            </div>
            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600"><Gift className="h-4 w-4" /></span>More local experiences are coming</div>
              <Link href="/events" aria-label="Explore MCOM events" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"><ArrowRight className="h-4 w-4" /></Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
