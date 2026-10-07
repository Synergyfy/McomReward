"use client";

import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Compass, ChevronLeft, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useGetPublicRewards } from '@/services/rewards/hook';

export default function RewardsMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const { data: rewardsData, isLoading } = useGetPublicRewards(1, 50, {
    search: searchQuery ? searchQuery.trim() : undefined,
  });

  const rewards = useMemo(() => rewardsData?.data ?? [], [rewardsData]);

  // Trending rewards: pick top items from DB
  const trendingCards = useMemo(() => {
    return rewards.slice(0, 4).map((r) => ({
      id: r.id,
      title: r.title,
      sub: r.description || `${r.max_points ?? 100} Points Required`,
      image: r.image && r.image.startsWith('http') && !r.image.includes('placehold.co')
        ? r.image
        : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      badge: (r.rewardType || r.reward_type) ? (r.rewardType || r.reward_type)!.toUpperCase() : 'EXCLUSIVE',
      badgeBg: 'bg-orange-600/10 text-orange-600 border border-orange-600/20',
      points: r.maxPoints ?? r.max_points ?? 0,
      value: r.value ?? 0,
    }));
  }, [rewards]);

  const filteredDeals = useMemo(() => {
    return rewards.filter((r) => {
      const type = (r.rewardType || r.reward_type || '').toLowerCase();
      if (selectedFilter === "All") return true;
      if (selectedFilter === "Coupons") return type === "coupon";
      if (selectedFilter === "Gift Cards") return type === "gift card";
      if (selectedFilter === "Products") return type === "physical product";
      if (selectedFilter === "Vouchers") return type === "voucher";
      return true;
    });
  }, [rewards, selectedFilter]);

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen pb-32 pt-6 max-w-6xl mx-auto px-4 md:px-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-gray-150">
        <Link href="/" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm">
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
            placeholder="Search rewards from database..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Trending Now Section */}
      {trendingCards.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" /> Trending Now
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-orange-600 font-bold text-xs uppercase tracking-wider cursor-pointer hover:underline flex items-center gap-1 outline-none select-none">
                Filter: {selectedFilter} <ChevronDown size={14} className="text-orange-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-2xl p-1.5 z-[100] mt-1">
                <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1">Reward Categories</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 my-1" />
                {["All", "Coupons", "Gift Cards", "Vouchers", "Products"].map((cat) => (
                  <DropdownMenuItem key={cat} asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                    <button
                      onClick={() => setSelectedFilter(cat)}
                      className={`w-full h-full px-2.5 py-2 text-xs font-bold flex items-center text-left bg-transparent border-none outline-none ${selectedFilter === cat ? 'text-orange-600 font-extrabold' : 'text-gray-700'}`}
                    >
                      {cat}
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
            {trendingCards.map((card) => (
              <div key={card.id} className="snap-start min-w-[85%] sm:min-w-[45%] relative overflow-hidden rounded-3xl h-64 flex flex-col justify-end p-6 border border-gray-200/80 shadow-sm group">
                <div className="absolute inset-0 z-0">
                  <img
                    className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
                    src={card.image}
                    alt={card.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
                <div className="relative z-20 space-y-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                  <h3 className="font-bold text-lg text-white leading-tight line-clamp-1">{card.title}</h3>
                  <p className="text-gray-300 text-xs line-clamp-1">{card.sub}</p>
                  <Link href={`/reward/${card.id}`} className="w-full block text-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-all text-xs">
                    View Reward
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Marketplace Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Explore Rewards ({filteredDeals.length})</h2>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
          </div>
          <div className="flex gap-2">
            <Grid className="w-5 h-5 text-orange-600 cursor-pointer" />
            <List className="w-5 h-5 text-gray-400 cursor-pointer hover:text-orange-600 transition-colors" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-150 animate-pulse h-48 flex flex-col justify-between">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
            <p className="text-gray-500 font-semibold">No rewards found for the selected criteria.</p>
            <button
              onClick={() => { setSelectedFilter("All"); setSearchQuery(""); }}
              className="text-orange-600 font-bold text-xs uppercase hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {filteredDeals.map((deal) => {
              const imgUrl = deal.image && deal.image.startsWith('http') && !deal.image.includes('placehold.co')
                ? deal.image
                : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';

              return (
                <div key={deal.id} className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="w-full aspect-video bg-gray-50 border border-gray-150 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm relative">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={imgUrl}
                        alt={deal.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {deal.rewardType ?? deal.reward_type ?? 'REWARD'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">{deal.title}</h3>
                      <p className="text-[10px] sm:text-xs text-orange-600 font-bold mt-1">
                        {(deal.maxPoints ?? deal.max_points) ? `${deal.maxPoints ?? deal.max_points} Points` : deal.value ? `£${deal.value} Value` : 'Exclusive'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5">
                        {deal.description || 'Verified Partner Reward'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/reward/${deal.id}`} className="mt-3 sm:mt-4 w-full text-center bg-gray-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-500/20 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-98">
                    View Deal
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}