"use client";

import React, { useState } from 'react';
import { Search, Store, Utensils, Ticket, Plane, Users, Gift, Home, Wallet, Gamepad2, User, ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function GiftCardMarketplace() {
  const [activeTab, setActiveTab] = useState<"buy" | "earn">("buy");
  const [selectedCategory, setSelectedCategory] = useState("View All");

  const categories = [
    { name: "View All", icon: Sparkles },
    { name: "Retail", icon: Store },
    { name: "Dining", icon: Utensils },
    { name: "Entertainment", icon: Ticket },
    { name: "Travel", icon: Plane }
  ];

  const giftCards = [
    {
      id: "sephora",
      name: "Sephora",
      category: "Retail",
      reward: "Earn 8% Back",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGoYRvVqGdOkiEKphOjepvDycP-ObJzvjizOfsmg60gp7GzurUFbgh04bpNIMzZldJv0MzkUSTSsAvDJgT6oWdIQ-adV_2rrefk8804hQ7Y4er8JAgSzTbZ-Ux0ZUA7q6wLOy4h4rSuwLHsgSExJI9GPypbpY_8X_Dpqa_d3dxkO0ta3f1FGZEXfxqq4yCT9OvalkB1gEONroBxC5QpUxzSNawtd4I5xJserfkiRYoWpjaeZnrMhelifG0ZvyG_TYoGnWY4-ScfnE",
      bgColor: "bg-white border border-gray-150"
    },
    {
      id: "amazon",
      name: "Amazon",
      category: "Retail",
      reward: "Earn 2% Back",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5Cq4sp2rif-m8fPCa8WWH1Z1V1Go6iFAvIkIiNOAL_k8ZfNl7_eInyLbUGn8nzuZteFSGqNa4DHI0PvuYRJhbQF-fKW3Hgpg4xuN5wRY7J6_xf9r8DwQj6O6ut5jpjaYLqDx666QVwi0OhjH_WopbBGeEr24Ds5DNWZT58-Y1A2u0h3XShxf7Mk320zbrnucSTSJCbGPE18OM-rSf9H_gR6Wv56lrNOmSlN4212oCpCuULj-oumv0I9ji5pqg8Kh6ODmL7loKO9o",
      bgColor: "bg-white border border-gray-150"
    },
    {
      id: "starbucks",
      name: "Starbucks",
      category: "Dining",
      reward: "Earn 5% Back",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyaZO-djADzKpAO-j5a4nMY3-OnYHkJ5uLjn3HM6uTYl6Q_qXyjsB-AINkfyBZTXOyJzuj76sZ3eczOBkcUcz49RRV6k3ux9cPb71eA7bF9AtgNatMnN4JG97AHY-LDBbjVj6SaSl8desZOP7ly_fR5MGV1pXa2Gg98ogkVAgJ9TEiw8bIPxH2K7PMlMHmiD0cI1-GJgHYjd9gdF3jm9YWO7fmP8P6w4wKt7-K3uzGmhkqSEI_1gftpq9h3Tqsnp40-A94juWPrVc",
      bgColor: "bg-[#00704A]/5 border border-[#00704a]/10"
    },
    {
      id: "netflix",
      name: "Netflix",
      category: "Entertainment",
      reward: "Earn 3% Back",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFSKhXiPVgm4b_U3WNOIFVZ47EBcGYizeBbp2ETHslsY8NrOYIKNqh2zAzXiiapoWyb0TZdJ-5RztOtpqQHM3Ie_GFsGFBQo8-yOTRY06_kaOnQTMzpHsJtWa7bWl-4UOsSgsKvU0fygEqhS8Y1XhPsa8QsNzrxsAtBkov6emNmCYjRt76jyea87tVQdMLlslz_lAXAPwJYVvoYwp6Cq7tcND7_5r60jd-yU49JlZ5zmi9uf-djZLImomn67IgUp63dd9-1jsY4Jk",
      bgColor: "bg-black/5 border border-black/10"
    },
    {
      id: "nike",
      name: "Nike",
      category: "Retail",
      reward: "Earn 6% Back",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPM4KthsNRwU42RoVKdOaiwrcDs0bog4JWEvgsUqFt-v_yO4yQP2M3CxM6o6kdi052c3aG3RSJk6CqyNxabEp_Gy5vCFTkPR3EpVSgn4KFHaUkHLtrgAPrPOmKsEtL0oEvSdjsvkU7t9dKFyJE9Zp3EotjPQ6Zukk23j8b_NYf8MSiYMd-CRlNpZHRp-yfh_g5IsfcP1JDwxnXfjeeOLy8Jl8XvmeE8CM3ayEEGVMuk4dESuxFXpq2Oy8UO1-qj3Mc6yVh1A-cjt0",
      bgColor: "bg-white border border-gray-150"
    }
  ];

  const filteredCards = giftCards.filter(
    (card) => selectedCategory === "View All" || card.category === selectedCategory
  );

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen pb-32 pt-6 max-w-6xl mx-auto px-4 md:px-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-gray-100">
        <Link href="/participant/market" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm">
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
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDexH88mYQ6vMpF1bGEs9pxEbj471iK18lqtQhcQypUMrgWT1iYgI3bNPPliwHmWWIPoHQWEF_g57MkdLoXMGO-JYLaqRCkTRLWS5xp7Qt-SRNFnmpKCYgf5JY6M-LOfMNle_5ERoyPMo6FQbksGhc9OT-IViAxp1-nkVsOy2aptMhC7bpCPaqoxefDcGWbCXuQD7qZAu2u9r7V0_PKtPXVB_qJQvF_7qfvLqqWNwO9CD8BIyz9kQAXq2kavg1UU6VsX-s7WsrgerQ')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8" />
          <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex flex-col justify-end text-white space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-600 text-white font-bold text-[9px] uppercase tracking-wider w-fit shadow-sm shadow-orange-600/20">
              Limited Offer
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Send Joy, Get 10% Back in Points
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm">
              Perfect for Starbucks, Sephora & more.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Control Bar */}
      <section className="flex items-center justify-between gap-4 py-2 border-y border-gray-100">
        {/* Left Side: Buy / Earn Dropdown */}
        <div className="relative w-40 sm:w-48 shrink-0">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as "buy" | "earn")}
            className="bg-white border border-gray-250 rounded-full py-1.5 pl-4 pr-10 text-xs font-extrabold text-gray-700 focus:outline-none focus:border-orange-600 appearance-none shadow-sm cursor-pointer w-full"
          >
            <option value="buy">Buy Gift Cards</option>
            <option value="earn">Earn Gift Cards</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </div>
        </div>

        {/* Right Side: Category selector dropdown on mobile */}
        <div className="relative shrink-0 block sm:hidden">
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
      </section>

      {/* Desktop Category Pills */}
      <section className="hidden sm:block overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
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
      <section className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">

        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-2 sm:space-y-4">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 ${card.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2.5 overflow-hidden shadow-sm`}>
                <img className="w-full h-full object-contain" src={card.logo} alt={card.name} />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight truncate">{card.name}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-orange-600 mt-1">{card.reward}</p>
              </div>
            </div>
            <Link
              href={`/gift-cards/${card.id}`}
              className="mt-4 sm:mt-6 w-full text-center bg-gray-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-500/20 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-98"
            >
              Buy Card
            </Link>
          </div>
        ))}
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


