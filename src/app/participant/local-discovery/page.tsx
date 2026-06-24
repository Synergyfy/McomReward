"use client";

import React, { useState } from 'react';
import { Sparkles, Utensils, Flower, ShoppingBag, Search, ChevronRight, MapPin, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LocalDiscovery() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCategory, setSelectedCategory] = useState("Featured");

  const categories = [
    { name: "Featured", icon: Sparkles },
    { name: "Dining", icon: Utensils },
    { name: "Wellness", icon: Flower },
    { name: "Retail", icon: ShoppingBag }
  ];

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
        {/* Category selector */}
        <div className="relative">
          {/* Mobile Dropdown Select */}
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

          {/* Desktop Category Pills */}
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

        {/* View Switcher */}
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
          {/* Featured Large Card */}
          {("Featured" === selectedCategory || "Dining" === selectedCategory) && (
            <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm group">
              <div className="aspect-[21/9] w-full relative overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXXMOvBW3lXRjdTSqHeMjgnsLoipbWU63zLEjoaYx3WPPMA9iVNsK9fkVquu-gWyGyb1rfLwALtEFoofKG39UfJNTttWQbT75E5Mvm3whG0VdpkWK9nodMXc7wFLSbLbstyuTJi2HfWuc7uo9BDZC2JePox-RXGlcHFRGRq6H379E7R53-Fq4nZuVRiJniWn-yyIFnkh0eECweaQABKAaI7bjZLquGnv7neU2PRETSB3jqul1RDEzDlglAkpnVHNwI4njOtf9UhUo"
                  alt="Vanguard Dining"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  25% Cashback
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-gray-200 overflow-hidden shadow-sm shrink-0">
                    <img
                      className="w-full h-full object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhvREq3h2x84hIGvgpdaGTTXBnB_E7_D6WdCQsVOVSLovvTBTY8FjrlEAW_4D9hxm0qw-eKeQ5lr9x1f2E1EPZQWK5cvGOM4vT5j0JN-_bXIABMn4ODgALlS174izHxwyyBDlR9uVddJg_T44XkMRZKaKYEslmiYbIcRRG8P06q0oxg6pOdoEooZA2weHALS8t9B7kbljXWsK1K74vqu8Sa22SLVuxIe3FgiGsv3kZ8boIz__PjHfsyhFssWbKuXXQ87bc_YdLsm0"
                      alt="Vanguard Dining Logo"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">Vanguard Dining</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Dining • 0.2 miles away</p>
                  </div>
                </div>
                <Link href="/merchants/vanguard-dining" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs text-center shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
                  View Storefront
                </Link>
              </div>
            </div>
          )}

          {/* Nearby Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 2 */}
            {("Featured" === selectedCategory || "Wellness" === selectedCategory) && (
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_KmixQ_mLpjKxIsTF74EgMuvg_jomabsx9iroRSrBzOhRlTBGvCDZoAik9v33sh6sjGPRDdpe7SRv3fXCIvUGGn8zxSijpw7EeGgpW_-42c4kYnKReEhW47OH9RAGfEi5HIIzb41kZ868nmDlbS_jyLX3x8nFCFkgRmVJYJjF1mdO1_OYVrRDc4xVe1UIwFxVAJL9D7H1dJaCTHqJt4vW8zCOatJ5gHOY6p8o1jbgAL6TpEJ4KUlNTDnJVU4ZiP3R2VJ9rmgcHhU"
                    alt="Aura Wellness Center"
                  />
                  <div className="absolute bottom-3 left-3 bg-orange-600 text-white px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow">
                    GOLD EXCLUSIVE
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">Aura Wellness Center</h4>
                      <p className="text-xs font-bold text-orange-600 mt-1">Free Hydro-Session</p>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold shrink-0">0.8 mi</span>
                  </div>
                  <Link href="/merchants/aura-wellness" className="w-full text-center py-2.5 rounded-xl border border-orange-500/20 text-orange-600 font-bold text-xs hover:bg-orange-600 hover:text-white transition-all active:scale-[0.98]">
                    View Storefront
                  </Link>
                </div>
              </div>
            )}

            {/* Card 3 */}
            {("Featured" === selectedCategory || "Retail" === selectedCategory) && (
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWTMh7e6IzGfQhGI2pga4TTAoAzjpLdjbDk1y0Lx0QbgTeNNnbloInyep7YCKTS1qgYsW68CEF_MDLLIsMYYPdmWHVkQS10RFLBB-EyAKZ9ACscfGI635YSpYoHIHI_Ge5YaZuG16nO04f-2mnW1DVarCci158JJrQs7NeUvVZPCcTaVQrCvlrwR6yudPGcE2yXHDEZW-RclZYLgoouaC1KFGgYvozZ3ghgaVIY1qdil4w3RprueyaLrzEO-iKopyVMMctqn8cHKM"
                    alt="Nebula Electronics"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">Nebula Electronics</h4>
                      <p className="text-xs font-bold text-orange-600 mt-1">Earn 500 Points</p>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold shrink-0">1.5 mi</span>
                  </div>
                  <Link href="/merchants/nebula-electronics" className="w-full text-center py-2.5 rounded-xl border border-orange-500/20 text-orange-600 font-bold text-xs hover:bg-orange-600 hover:text-white transition-all active:scale-[0.98]">
                    View Storefront
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Map View Content */}
      {viewMode === "map" && (
        <section className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden border border-gray-250 shadow-md">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-gray-100">
            <div
              className="w-full h-full opacity-60 grayscale contrast-125 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCl-jdKCGnzQraL3ljoBbbXQ1uM0BLZ9I5aAX8vQGY5wh4lrIUo8BLqqWiwh8eCDOatxv-W3BBdl-h_bYVX-vBWX5aUkR4i-1okOtBN62DPbhmN7rHQ3dRmCpbsVg0P85soR9Vpy-TLn0OSBthN8k32hnkVyV3C74oAPr3NYGnXgBsBjTobDh6VPRg8rVBfqDx7Q3E2gy_hoaG1JteutqBpRzhURANT5A8HVrx1IyVQSgiEmrOtISCbpS3Z5fP-LZVlvzdESdhi2uU')"
              }}
            />
            {/* User Pin */}
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-orange-600 rounded-full border-2 border-white shadow-[0_0_12px_rgba(245,73,0,0.5)] animate-pulse" />
            </div>

            {/* Marker 1: Vanguard Dining */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center border-2 border-white shadow-md relative z-10 group-hover:scale-110 transition-transform">
                <Utensils size={14} className="text-white" />
              </div>
              <div className="absolute inset-0 bg-orange-500/25 rounded-full scale-150 animate-ping pointer-events-none" />
            </div>

            {/* Marker 2: Aura Wellness */}
            <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-md relative z-10 group-hover:scale-110 transition-transform">
                <Flower size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* Floating Info Card */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-lg flex gap-4 items-center max-w-md md:mx-auto">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFsVuKgMKorEjlU9FsnK_yXSIjJgXOv-dlcIjjYnd1uPmWvj9f9Pe1IcnjWS2Mmk3onMJJNVZUwQbwVqkGq4vBRynpOzyH2XRMxXnpJvn8L4liIR8JVKRStlsXzolK1X9ohPfxedc5RGcwgWrzNSayyStwPqt0L5zJafyMNUjLfjb-IDyj34-UNLxdaeDU5lQQA_InPVHKRkxS9r8XMUNwxYBqZOWG5Wrm6W9eIfaxmK84k3def0ewykop5s5fyt1mFsx1rggeCxw"
                alt="Vanguard Dining Display"
              />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">FEATURED NEARBY</p>
              <h4 className="font-extrabold text-sm text-gray-900 truncate">Vanguard Dining</h4>
              <p className="text-xs text-gray-405 font-medium">0.2 miles • Active Offer</p>
            </div>
            <Link href="/merchants/vanguard-dining" className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-full shadow-md active:scale-95 transition-all">
              <ChevronRight size={16} />
            </Link>
          </div>
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
