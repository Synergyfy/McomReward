'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Gift, 
  Store, 
  MapPin, 
  Award, 
  Percent, 
  ChevronRight, 
  Utensils, 
  Flame, 
  Activity 
} from 'lucide-react';

export default function MarketplaceHub() {
  const [searchQuery, setSearchQuery] = useState("");

  const mainCategories = [
    {
      title: "Gift Cards",
      description: "Buy & redeem instant vouchers",
      icon: Gift,
      color: "bg-orange-50 text-orange-600 border-orange-100",
      link: "/gift-cards"
    },
    {
      title: "Brand Partners",
      description: "Earn points at 500+ top brands",
      icon: Store,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/brands"
    },
    {
      title: "Local Shops",
      description: "Discover bistros & gyms near you",
      icon: MapPin,
      color: "bg-green-50 text-green-600 border-green-100",
      link: "/participant/local-discovery"
    },
    {
      title: "Points Rewards",
      description: "Redeem points for premium gifts",
      icon: Award,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      link: "/reward"
    },
    {
      title: "Hot Deals",
      description: "Limited-time cashback & promos",
      icon: Percent,
      color: "bg-red-50 text-red-600 border-red-100",
      link: "/deals"
    }
  ];

  const featuredBrands = [
    { name: "Nike Store", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Bq1NQQlVF34L2wxiQq-q7CK1LqHJMI-VETbxKKAf3x1-uqQ-rqaPL-uSoSKWNgKWAENgGrXPgpTgNg8qHgL_3k6GHsMRqJL3JM6170ZOL5rAf7zg69fDqSJl7nqcjddxfAbJH3loD_6ZsOp20twyeT_sCw95-SBehxm44jgx-cW5preS0sgqy4ZuIiMJyj3RzF0lXmooMl6hduUflqEmN8bLJiIxTWpDzWecyatJcHMoorUHoK8PJ_yjTmGbBRmJ5l7D8A_k8cQ", link: "/brands" },
    { name: "Starbucks", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaAqqajmX0l_gLPVy8SdfAp0x7RhzBINLbzr_eH6lkgTtewIVH_vibvMHHGUvS6CaRFX25OsDu6jneriGqfYp79YZWTYcrLsqQSfTNSwhqfp1JhRmZGU4Y4ki_y7kVch6CNtmubWsr0PBwFA4LjxGbh_REtgf45Kv1_DgZ6jhHSyEBr6AoMB8M3lBlLFVX7HN30lt8Twy8LKMiWU6xR-5jOWy6zdMGP3zbXSkWhG1YiQxJ5kU5tsHAiBsEB9ksrMTuu61188ThYSE", link: "/gift-cards" }
  ];

  return (
    <div className="text-gray-800 pb-32 max-w-6xl mx-auto space-y-4">

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input 
          type="text" 
          placeholder="Search brands, gift cards, rewards, or deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Main Categories Bento Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Explore Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mainCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={idx} 
                href={cat.link}
                className="flex items-center p-5 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mr-4 shrink-0 border`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{cat.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{cat.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors ml-2" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Items Row */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Featured Offers</h2>
          <Link href="/deals" className="text-orange-600 font-bold text-xs uppercase hover:underline flex items-center gap-0.5">
            See All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredBrands.map((brand, idx) => (
            <Link 
              key={idx} 
              href={brand.link}
              className="flex-shrink-0 h-44 rounded-3xl bg-white border border-gray-200 relative overflow-hidden group shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                style={{ backgroundImage: `url('${brand.image}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-5 w-full flex justify-between items-end">
                <div>
                  <span className="bg-orange-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-2 inline-block">FEATURED</span>
                  <h4 className="font-bold text-base text-white">{brand.name}</h4>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2 text-white group-hover:bg-orange-600 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby Preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Near You</h2>
          <Link href="/participant/local-discovery" className="text-orange-600 font-bold text-xs uppercase hover:underline flex items-center gap-0.5">
            Open Map <ChevronRight size={12} />
          </Link>
        </div>
        <Link 
          href="/participant/local-discovery"
          className="bg-white rounded-3xl border border-gray-200 p-4 flex gap-4 items-center group cursor-pointer hover:bg-gray-50 hover:border-orange-500/20 transition-all shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA80Kg3kKrrtE9bYf0CxcBmlukSNK-nJGC9f_xi3C_ytikW6NY0UPgM8zfGyCRsaGQHplq3FdsKr1hn8UXzWyWO6-9HhSFd5SqJ9IH5fitm-e5LQh3bTb0qvn-bOeOacqzN6w01JmDG8OsELSir90jacnatxtVg3OP0hGra6lcjKRdPvSfCcUOd3biqpa00yu5FTEEdstQI3gNDJgnrNlP0ZUO6lu59X_h3hKHVf8lIjbzYgmzjF6ZqiZGPdkq2DRzPIHAFdFW3QQU" alt="Green Fork Bistro" />
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-bold text-sm text-gray-900 truncate">The Green Fork Bistro</h4>
            <p className="text-gray-400 text-xs mt-0.5">0.4 miles away • Dining</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-gray-500 text-[10px] font-bold">4.9 (1.2k reviews)</span>
            </div>
          </div>
          <div className="text-right shrink-0 pr-2">
            <p className="text-orange-600 font-black text-base leading-none">5x</p>
            <p className="text-gray-400 text-[8px] uppercase tracking-wider font-extrabold mt-0.5">Points</p>
          </div>
        </Link>
      </section>

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
