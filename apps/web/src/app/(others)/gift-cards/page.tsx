"use client";

import React, { useState, useMemo } from 'react';
import { Search, Store, Utensils, Ticket, Plane, Users, Gift, ChevronLeft, Sparkles, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useGetPublicRewards } from '@/services/rewards/hook';

export default function GiftCardMarketplace() {
  const [activeTab, setActiveTab] = useState<"buy" | "earn">("buy");
  const [selectedCategory, setSelectedCategory] = useState("View All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "View All", icon: Sparkles },
    { name: "Retail", icon: Store },
    { name: "Dining", icon: Utensils },
    { name: "Entertainment", icon: Ticket },
    { name: "Travel", icon: Plane }
  ];

  // Fetch gift cards from DB
  const { data: rewardsData, isLoading } = useGetPublicRewards(1, 50, {
    reward_type: "gift card",
    search: searchQuery ? searchQuery.trim() : undefined,
  });

  const rawCards = useMemo(() => rewardsData?.data ?? [], [rewardsData]);

  const cards = useMemo(() => {
    return rawCards.map((r) => {
      // Guess category from title or description
      let cat = "Retail";
      const lower = (r.title + " " + r.description).toLowerCase();
      if (lower.includes("starbucks") || lower.includes("uber") || lower.includes("dining") || lower.includes("coffee") || lower.includes("food")) {
        cat = "Dining";
      } else if (lower.includes("netflix") || lower.includes("ticket") || lower.includes("movie") || lower.includes("entertain")) {
        cat = "Entertainment";
      } else if (lower.includes("travel") || lower.includes("flight") || lower.includes("hotel") || lower.includes("airline")) {
        cat = "Travel";
      }

      return {
        id: r.id,
        name: r.title,
        category: cat,
        reward: `${r.max_points ?? 250} Points to Redeem`,
        value: r.value ? `£${r.value}` : 'Digital Card',
        logo: r.image && r.image.startsWith('http') && !r.image.includes('placehold.co')
          ? r.image
          : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
        description: r.description,
      };
    });
  }, [rawCards]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCat = selectedCategory === "View All" || card.category === selectedCategory;
      const matchesSearch = !searchQuery || card.name.toLowerCase().includes(searchQuery.toLowerCase()) || card.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [cards, selectedCategory, searchQuery]);

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen pb-32 pt-6 max-w-6xl mx-auto px-4 md:px-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-gray-100">
        <Link href="/" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:block">MCOM Mall</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gift Card Marketplace</h1>
        </div>
      </header>

      {/* Hero Section / Promo */}
      <section>
        <div className="relative w-full rounded-3xl overflow-hidden aspect-[21/9] border border-gray-150 shadow-sm group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1600&auto=format&fit=crop&q=80')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 z-20 w-full flex flex-col justify-end text-white space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-600 text-white font-bold text-[9px] uppercase tracking-wider w-fit shadow-sm shadow-orange-600/20">
              Database Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Digital Brand Gift Cards
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm">
              Instant delivery to your MCOM digital wallet. Redeemable across top brands.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Control Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-y border-gray-100">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search gift cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-1.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Right Side: Tab switcher */}
        <div className="relative w-full sm:w-48 shrink-0">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as "buy" | "earn")}
            className="bg-white border border-gray-250 rounded-full py-1.5 pl-4 pr-10 text-xs font-extrabold text-gray-700 focus:outline-none focus:border-orange-600 appearance-none shadow-sm cursor-pointer w-full"
          >
            <option value="buy">Digital Gift Cards</option>
            <option value="earn">Earn Gift Cards</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </div>
        </div>
      </section>

      {/* Desktop Category Pills */}
      <section className="overflow-x-auto no-scrollbar py-1">
        <div className="flex gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.name
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/15'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Marketplace Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Available Cards ({filteredCards.length})</h2>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-150 animate-pulse h-48 flex flex-col justify-between">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-gray-500 font-semibold">No gift cards match your filter.</p>
            <button
              onClick={() => { setSelectedCategory("View All"); setSearchQuery(""); }}
              className="text-orange-600 font-bold text-xs uppercase hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-full aspect-video bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 overflow-hidden shadow-sm border border-gray-150 relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={card.logo}
                      alt={card.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {card.value}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-1 truncate">{card.name}</h3>
                    <p className="text-[10px] sm:text-xs font-bold text-orange-600 mt-1">{card.reward}</p>
                    <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5">{card.description}</p>
                  </div>
                </div>
                <Link
                  href={`/gift-cards/${card.id}`}
                  className="mt-3 sm:mt-4 w-full text-center bg-gray-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-500/20 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-98"
                >
                  Buy Card
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Send as Gift CTA */}
      <section>
        <div className="bg-orange-600/5 p-8 rounded-3xl border border-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group shadow-sm shadow-orange-600/2">
          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 leading-tight">Group Gifting?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Pool points with friends to send bigger surprises.
              </p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-bold text-xs flex items-center gap-2 mx-auto sm:mx-0 shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
              Start a Group Gift <Users size={14} />
            </button>
          </div>
          <div className="relative z-10 shrink-0 text-orange-600/10 group-hover:scale-105 transition-transform duration-500 pr-4">
            <Gift size={100} className="stroke-[1]" />
          </div>
        </div>
      </section>
    </div>
  );
}
