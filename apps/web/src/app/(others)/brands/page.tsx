"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft } from 'lucide-react';
import { useGetPublicCampaigns } from '@/services/customer-campaigns/hook';

export default function BrandsMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError } = useGetPublicCampaigns(1, 50, undefined, undefined, undefined, searchQuery || undefined);

  const businesses = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sector: string; logo: string | null; campaigns: { id: string; name: string; bannerUrl: string }[] }>();
    for (const c of data?.data ?? []) {
      const b = c.business;
      if (!b) continue;
      const entry = map.get(b.id) ?? {
        id: b.id,
        name: b.name,
        sector: b.sectorName ?? 'General',
        logo: b.profileImage ?? null,
        campaigns: [],
      };
      entry.campaigns.push({ id: c.id, name: c.name, bannerUrl: c.bannerUrl });
      map.set(b.id, entry);
    }
    return [...map.values()];
  }, [data]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(businesses.map((b) => b.sector)))],
    [businesses],
  );

  const filtered = businesses.filter((b) => {
    const matchesCategory = selectedCategory === "All" || b.sector === selectedCategory;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = useMemo(
    () => (data?.data ?? []).find((c) => c.bannerUrl),
    [data],
  );

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen pb-32 pt-6 max-w-6xl mx-auto px-4 md:px-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/participant/market" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm shrink-0">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:block">MCOM Mall</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Brands Marketplace</h1>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </header>

      {/* Featured campaign banner */}
      {featured && (
        <section>
          <div className="relative w-full h-56 rounded-3xl overflow-hidden shadow-md group border border-gray-100">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${featured.bannerUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block shadow-sm shadow-orange-600/20">
                  Featured Campaign
                </span>
                <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">{featured.name}</h2>
                <p className="text-sm font-semibold text-orange-400 mt-1">{featured.business?.name}</p>
              </div>
              <Link href={`/merchants/${featured.id}`} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm text-center shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
                View Campaign
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Category Navigation */}
      <section className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/15'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Businesses Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading businesses…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Could not load businesses. Please try again.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No businesses found.</p>
        ) : filtered.map((brand) => (
          <div
            key={brand.id}
            className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-2 sm:space-y-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2.5 overflow-hidden shadow-sm">
                {brand.logo ? (
                  <img className="w-full h-full object-contain" src={brand.logo} alt={brand.name} />
                ) : (
                  <span className="text-lg font-extrabold text-orange-600">{brand.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight truncate">{brand.name}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-orange-600 mt-1 truncate">{brand.sector} &bull; {brand.campaigns.length} active campaign{brand.campaigns.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <Link
              href={`/merchants/${brand.campaigns[0].id}`}
              className="mt-4 sm:mt-6 w-full text-center bg-gray-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-500/20 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-98"
            >
              View Rewards
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
