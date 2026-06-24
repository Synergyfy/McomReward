"use client";

import React, { useState } from 'react';
import { Search, Grid, List, Compass, Star, ChevronLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export default function RewardsMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");


  const trendingCards = [
    {
      id: "dining-50",
      title: "50% Off Signature Dining",
      sub: "The Gilded Lounge & Terrace",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCohttYiP6FRkdTWnRoWhF3DrkkpbaLMVVmUM3KHayDwB5fLAM-ikGY__LVuINASRoPQzXe1oYC53ayPc8TMMlQkYAaMxhAd5DT6xZMiU9qZxFkKbLpv8_Rsxgxb03TPgp3nfylfbkFV-rCTnv-Q5htOpgQDozvzRYbGXkYePLp7v_JrSv5kmzKVEufv7F3BfpicOUi0_mNieUd6XUrRRtI8QTuGFE7AnYq8GDOYKiBsEuc-E12RQ2wPAk7eYsAs-Ps0v_LahLk7I4",
      badge: "High Value",
      badgeBg: "bg-green-600/10 text-green-600 border border-green-600/20"
    },
    {
      id: "tech-bundle",
      title: "Exclusive Tech Bundle",
      sub: "Aether Electronics",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuL4P-DchRV8C-rSmsAM5HVOBzF3u4qBVXCJuxgh9PtSd3AGZxoh-jIDn_0Z2fQ-xKM_3ausLXID3b49xmFixb7S9hoZN-lLn-2U_w21FzLfnj0dpdMgL1m74D9a9JIh3ZGtuaRm88r-zcxY5A90Rubp_8Ns90EKnwJHiaP46rObvjcKSEwzodSqYqrSlD5xJEvCNSnRfPyDaRtU_RE1UOgVdQ3oWJw6IyM2nhot5IYICPws_7RuYizJeVLWg63Xa6gxTh34ZtBe4",
      badge: "Limited Edition",
      badgeBg: "bg-orange-600/10 text-orange-600 border border-orange-600/20"
    }
  ];

  const exploreDeals = [
    {
      id: "bogo-coffee",
      title: "Buy 1 Get 1 Free",
      brand: "Luxe Brew Roasters",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUU1FYKniNc_fg9DKr6Gb_H4QRsvQrXUvkgR4H7ojyC_ThQXMCtd5YA96tcy0fiilj3Cyx3n-OT-SI275a_RrWqDRyaQeF5rxcnF_yK27gxiJLm_M-NZ_SXg99hNwKCmsWLuXbydDcwTbXst0xRsSsyMsLgzg-z4kub-3J2Fr5EQSFFb10BJ0RghHmSkFlPU-XXtvn554E6KEdntHuGitVqyh6yJF4zVoZKTOpl_kC85COOczdXM4-uqKX6WtCiHceD1hZFYXs6Mg",
      type: "Local"
    },
    {
      id: "welcome-credit",
      title: "$50 Welcome Credit",
      brand: "Avenue Couture",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzHO8x58rvqs-YcbWqgdfMcpsE5UKRnepVtt-qecEPBszTmLQPVMWwHhclnLW8vRYgvRewKbLvA788BpQ3ExtQ_yr88p4C78kHMkiLI4zCZcKlTgJ3jXmvPMYyZcZDKCvmHzasF5LzlrpoZVdM5CR2NTObmZ-rN88CmzHWoVGS73sYv6m_694-NXCAUDg3lDruznOfy2ilx_8mrAw-Vyb7YmtYHAsXR3hHbDOhkKIaTySz1q864IQ7UU4rp7H1g1hjo6CJ9znOHnk",
      type: "Brands"
    },
    {
      id: "gym-pass",
      title: "Free Day Pass",
      brand: "Vigor Health Club",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuARwSIT4pNgSrNIq8uU1_lHaY3yvM9RhcziTEAGZbizSv4ejC3U8wCwr8rWHj3TmWCdJ_mg0h50_9cYdOe-JldQuGVi4AtZ37le-yVCoXNoqWKUoLezfesBowLexk6PTpzD_I-y68RTvjvn1JJQwZzmjRxuwn5FkAFtMLO8AIIDkLCoM0y5SDYbkZOMsdwbON-tzBFYELcB3HlSiSiceckOca-UHB1uWdops0iiThNN9TCXTyjnLLo5OWPhv5sc_vhFRwjgELy3JAE",
      type: "Local"
    },
    {
      id: "air-miles",
      title: "10,000 Air Miles",
      brand: "SkyHigh Alliance",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwxxbPGDYRAPjqMLKom526gVcrg-UJhiJsxSTaHjdxVJcpgIoVldOeDAl9RWnK66qOW1wSudnEZ0dAuPQo2qMncqnPEvevtXoJmtv-ZzqpBqR2pEFDgb6Tf6uFyEedkZ-eEaYl1l9E_chZK4pFutYotkvvtSCApdW_X2ENlrlWmEQlQMrWnclKC1K-TehBx3NJCoQhBUkgfxOGHRbbFL7Z0AlnkCdn8oBPGBFEBmpu6a0a-uX60o-4EZe86JdGVIjpCpE9mv8Y14M",
      type: "Exclusive"
    }
  ];

  const filteredDeals = exploreDeals.filter((deal) => {
    const matchesFilter = selectedFilter === "All" || deal.type === selectedFilter;
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || deal.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen pb-32 pt-6 max-w-6xl mx-auto px-4 md:px-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-gray-150">
        <Link href="/participant/market" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:block">MCOM Mall</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Rewards Marketplace</h1>
        </div>
      </header>

      {/* Search Section */}
      <section className="space-y-4">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm placeholder:text-gray-400"
            placeholder="Search rewards, brands, or places..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Trending Now</h2>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-orange-600 font-bold text-xs uppercase tracking-wider cursor-pointer hover:underline flex items-center gap-1 outline-none select-none">
              View All <ChevronDown size={14} className="text-orange-600" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-2xl p-1.5 z-[100] mt-1">
              <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1">Reward Filters</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 my-1" />
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <button onClick={() => setSelectedFilter("All")} className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center text-left bg-transparent border-none outline-none">
                  All Rewards
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <button onClick={() => setSelectedFilter("Brands")} className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center text-left bg-transparent border-none outline-none">
                  Online Brands
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <button onClick={() => setSelectedFilter("Local")} className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center text-left bg-transparent border-none outline-none">
                  Local Brands
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <button onClick={() => setSelectedFilter("Exclusive")} className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center text-left bg-transparent border-none outline-none">
                  Exclusive Deals
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <button onClick={() => setSelectedFilter("Near Me")} className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center text-left bg-transparent border-none outline-none">
                  Near Me
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {trendingCards.map((card) => (
            <div key={card.id} className="snap-start min-w-[85%] sm:min-w-[45%] relative overflow-hidden rounded-3xl h-64 flex flex-col justify-end p-6 border border-gray-200/80 shadow-sm group">
              <div className="absolute inset-0 z-0">
                <img className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" src={card.image} alt={card.title} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />
              <div className="relative z-20 space-y-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${card.badgeBg}`}>
                  {card.badge}
                </span>
                <h3 className="font-bold text-lg text-white leading-tight">{card.title}</h3>
                <p className="text-gray-300 text-xs">{card.sub}</p>
                <Link href={`/reward/${card.id}`} className="w-full block text-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-all text-xs">
                  Claim Reward
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Explore Deals</h2>
          <div className="flex gap-2">
            <Grid className="w-5 h-5 text-orange-600 cursor-pointer" />
            <List className="w-5 h-5 text-gray-400 cursor-pointer hover:text-orange-600 transition-colors" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-2 sm:space-y-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-50 border border-gray-150 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
                  <img className="w-full h-full object-contain" src={deal.logo} alt={deal.brand} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors truncate">{deal.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-0.5 truncate">{deal.brand}</p>
                </div>
              </div>
              <Link href={`/reward/${deal.id}`} className="mt-4 sm:mt-6 w-full text-center bg-gray-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-500/20 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-98">
                Claim
              </Link>
            </div>
          ))}

          {/* Complimentary Facial Special Bento Card */}
          {("All" === selectedFilter || "Exclusive" === selectedFilter) && (
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-orange-500/25 shadow-sm shadow-orange-500/5 col-span-2 relative overflow-hidden group flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-150 p-2 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-TB28ZdRHsQ-3INh_m8hOLoC01KPZ9gDTzaiyL-m9Ez0uZuk-mQSaSIS93iQuDrJz6bgXjF0K1iA4kj0lxvJCs4daWwbz6mtTQKdh5bm6CaHRO7Tc0w4-Wf9nxr0fzj88dRQfxYUjBcd4RFpCWargzFT2p9xdTqBGdVEPqIJE5vxWOJrmNfwtNbpS_FweHP_qdSlXc_6m-VXAyy0Y1Ej9KCiuFtNNYWlO80dwL2QrbwK12ZotKxBcp3WLX86IdhBkqYX84wj57Mk" alt="Zenith Spa" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">Complimentary Facial</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Zenith Holistic Spa</p>
                  </div>
                </div>
                <div className="h-full flex items-center pr-4">
                  <Compass className="w-16 h-16 text-orange-600/10 stroke-[1]" />
                </div>
              </div>
              <Link href="/reward/spa-facial" className="relative z-10 mt-6 w-full text-center bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
                Unlock Special Offer
              </Link>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}