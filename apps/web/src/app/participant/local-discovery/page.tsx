"use client";

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Utensils, Flower, ShoppingBag, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGetPublicDeals } from '@/services/deals/hook';

const LocalDiscoveryMap = dynamic(
  () => import('@/components/participant/LocalDiscoveryMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
      </div>
    ),
  }
);

export default function LocalDiscovery() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCategory, setSelectedCategory] = useState("Featured");

  const { data: dealsData, isLoading } = useGetPublicDeals({ page: 1, limit: 20 });

  const deals = (dealsData?.data ?? []).filter(deal => deal.isActive !== false);

  const categories = [
    { name: "Featured", icon: Sparkles },
    { name: "Dining", icon: Utensils },
    { name: "Wellness", icon: Flower },
    { name: "Retail", icon: ShoppingBag }
  ];

  const filteredDeals = useMemo(() => {
    if (selectedCategory === "Featured") return deals;
    return deals.filter(deal =>
      deal.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [deals, selectedCategory]);

  const mapDeals = filteredDeals.slice(0, 3);

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen pb-32 pt-2 sm:pt-6 max-w-6xl mx-auto px-2 sm:px-4 md:px-8 space-y-4">
      {/* Header */}
      <header className="flex items-center gap-3 py-2 sm:py-4 border-b border-gray-100">
        <Link href="/participant/market" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">MCOM Discovery</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Business Discovery</h1>
        </div>
      </header>

      {/* Explore Local Perks & View Switcher */}
      <section className="flex items-center justify-between gap-4 py-2 border-y border-gray-100">
        <div className="relative">
          <div className="relative block sm:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-250 rounded-full py-1.5 pl-4 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:border-orange-600 appearance-none shadow-sm cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </div>
          </div>

          <div className="hidden sm:flex gap-2">
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
        </div>

        <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm w-fit shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === "list"
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === "map"
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Map
          </button>
        </div>
      </section>

      {/* List View Content */}
      {viewMode === "list" && (
        <section className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-medium">
              No offers found for this category.
            </div>
          ) : (
            <>
              {/* Featured Large Card */}
              <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm group">
                <div className="aspect-[21/9] w-full relative overflow-hidden">
                  {filteredDeals[0].imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={filteredDeals[0].imageUrl}
                      alt={filteredDeals[0].title}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {filteredDeals[0].isReward ? 'Reward' : 'Live Offer'}
                  </div>
                </div>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">{filteredDeals[0].title}</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        {filteredDeals[0].business?.name}{filteredDeals[0].category?.name ? ` • ${filteredDeals[0].category.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <Link href={`/deals/${filteredDeals[0].id}`} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs text-center shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
                    View Deal
                  </Link>
                </div>
              </div>

              {/* Nearby Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDeals.slice(1).map((deal) => (
                  <div key={deal.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
                    <div className="aspect-[16/10] relative overflow-hidden">
                      {deal.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={deal.imageUrl}
                          alt={deal.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">{deal.title}</h4>
                          <p className="text-xs font-bold text-orange-600 mt-1">{deal.business?.name}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold shrink-0">{deal.category?.name ?? ''}</span>
                      </div>
                      <Link href={`/deals/${deal.id}`} className="w-full text-center py-2.5 rounded-xl border border-orange-500/20 text-orange-600 font-bold text-xs hover:bg-orange-600 hover:text-white transition-all active:scale-[0.98]">
                        View Deal
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Map View Content */}
      {viewMode === "map" && (
        <section className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden border border-gray-250 shadow-md">
          <div className="absolute inset-0">
            <LocalDiscoveryMap deals={filteredDeals} />
          </div>

          {mapDeals[0] && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-lg flex gap-4 items-center max-w-md md:mx-auto">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                {mapDeals[0].imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="w-full h-full object-cover"
                    src={mapDeals[0].imageUrl}
                    alt={mapDeals[0].title}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">FEATURED NEARBY</p>
                <h4 className="font-extrabold text-sm text-gray-900 truncate">{mapDeals[0].title}</h4>
                <p className="text-xs text-gray-400 font-medium">{mapDeals[0].business?.name}</p>
              </div>
              <Link href={`/deals/${mapDeals[0].id}`} className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-full shadow-md active:scale-95 transition-all">
                <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* BottomNavBar Section */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
        <Link href="/participant" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/participant/market" className="flex flex-col items-center justify-center bg-orange-100 text-orange-600 rounded-full px-4 py-1 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <span className="text-[10px] font-bold mt-0.5">Market</span>
        </Link>
        <Link href="/participant/wallet" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span className="text-[10px] font-bold mt-0.5">Wallet</span>
        </Link>
        <Link href="/play-win" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">casino</span>
          <span className="text-[10px] font-bold mt-0.5">Games</span>
        </Link>
        <Link href="/participant/settings" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}