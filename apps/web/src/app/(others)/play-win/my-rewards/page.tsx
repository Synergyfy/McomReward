"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, Sparkles, Award, Coffee, Laptop, Sparkle, Utensils, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const initialRewards = [
  {
    id: 1,
    title: "Free Specialty Coffee",
    description: "Redeem your weekly member reward at any Artisan Brew location.",
    tag: "Hot Deal",
    value: "$7.50",
    expiry: "Oct 24, 2026",
    status: "Available",
    icon: Coffee,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqCHk-bIeNBeg6aF9d8PzWj3YE9jvvsV6sqLiK08A-mRd4kEjdr2ywLYMoqVMU8iukVsegAeUFjBtvtM54baEP6Nwp6GhUbjkJ4ul06chRTsdlQYakHKzF3r7RsEsgKUdQU2-WObppDCyuLcUpzUZaoEZ_c8yBhZL3nXxzkND9cSkQalRonydchMsV-e5aoVbdUc6Wj7CENZvjboEjN4jO4eTZpd8ZUkOnauDaIebQXDVGKU1SF7ToBdImqp9Yrjnm11p32Qc86fc"
  },
  {
    id: 2,
    title: "$50 Tech Voucher",
    description: "Valid for any purchase over $200 at ElectroSync Stores.",
    tag: null,
    value: "$50.00",
    expiry: "Nov 12, 2026",
    status: "Available",
    icon: Laptop,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTf4YR00TnhVcZ3y2bvvzdo3o7Y2PrY04FvpI7d6k7WE87uY15TD0YyBCjWcLdUf3qEE-rNosImUjHsCWJOENKZXlDTJ60zqX2uwAU9muSYvrpp4tSy0AOU6Zs9gkeoPR-gC-LFF05vW-C5ipgB4cMC9GAyCZ2zWi3oIY3AvJfrtboR11D_bLRpCF1KxSYFc39HCeTmGKGFEDV0JPNvaVA1aL_Yq9x2-9fF4V-b23q9w_0gAPEjycQ3a4CFEG2mJlLhVQE25NMuZI"
  },
  {
    id: 3,
    title: "Complimentary Spa Session",
    description: "Enjoy a 30-minute deep tissue massage at Zen Retreat.",
    tag: null,
    value: "$120.00",
    expiry: "Oct 30, 2026",
    status: "Available",
    icon: Sparkle,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMaWDJG3U0CIEMHkroNlC-AgzAUAOtQLHjPOqBNfPwRCpBNuI76170pV-hdMNyuNe_cdKqs9SEkp7fDsC_J4Y-z5gj9CS6wWxGaVVQQfq58kEotWtK0X1bOvjEYGVLaut3zp0m10X9QHfVxswtHrDZeGfJ_7kT1JjBjihrQhwGpVpfwrgGP8ADfI16G4N7KyHA1SI3xdFPKka_i8MEqVpiRcLqj20_H5QwIVah3gBxUPfujDx1__SbbQn8PfFLCUF--EyPbV7Dipg"
  },
  {
    id: 4,
    title: "Dinner for Two - 25% Off",
    description: "Exclusive discount at Le Diamant Bleu for Gold Members.",
    tag: null,
    value: "Variable",
    expiry: "Dec 31, 2026",
    status: "Available",
    icon: Utensils,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuATc9khy_x34BgPuNtAuT9Cq4g2IvPbj8fEo7CXZAsWapterwMWx2SjU08J8W5QKthuonfNepNlmQNxmJWWYO9I7tTxXnwj3sz19DQzj5UnYQ1dDAiwGccEJ_JwsPluRu8c82u4-F4w6HLVNtcRh1OwYoMxm5xjcdRoITrR8iBZC1t32uV4RrqSuHOZLRPB5s8wb1TO2UUWpDY2gkoE55Kg_pO0AHspgD_aoQY2RejMK6SL6B2zc7nuDQsOapPxH-oYkYRGqXIHdkk"
  }
];

export default function MyRewardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Available");
  const [rewards, setRewards] = useState(initialRewards);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRedeem = (id: number, title: string) => {
    setRewards(prev =>
      prev.map(r => (r.id === id ? { ...r, status: "Claimed" } : r))
    );
    toast.success(`Successfully claimed: ${title}!`, {
      icon: <Sparkles className="w-4 h-4 text-orange-600" />,
      className: "rounded-2xl border-gray-200 bg-white text-gray-800",
    });
  };

  const filteredRewards = rewards.filter(r => r.status === activeTab);

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen py-2 sm:py-8 max-w-7xl mx-auto px-2 sm:px-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 sm:py-4 border-b border-gray-150">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/play-win')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm shrink-0">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9VD6OZNn8MOPsQ22XYpHWunTHLDPf1tlXLcJ-LpUpb7O5tWGCEC6UJc26iCRmQ85Mm3UGPMpKCXkj4d91rdGmKpQxcXL5IDCWjfqMuPnB8HAzy2VoIak5yn3oVf8uDvldKIbnAt4xvMkD7PuQN0s9Z4fTW6N1Q49297TukDjI8lPmHxxXAr76lDLDkWawBM-J1Kdr9BWm6lhe6t_FTTiW8D0n_9n2OSw1_PVOt9AGXHmz-zb5UPacsAUPRfpKUC-qcVKUS3qkqkc"
                alt="Gold Member Avatar"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                My Rewards <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-500/20">Gold Member</span>
              </h1>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 duration-200 transition-all shadow-sm">
          <Search size={18} />
        </button>
      </header>

      {/* Points Summary Widget */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-gray-200/80 shadow-md group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/5 opacity-40 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Balance</p>
            <h2 className="text-5xl font-extrabold tracking-tight mt-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-[#ff843a] leading-none flex items-baseline gap-1">
              24,850
              <span className="text-lg font-bold text-gray-400 ml-1">PTS</span>
            </h2>
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500">Platinum Progress</span>
              <span className="text-orange-600">75%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                style={{ width: "75%" }}
                className="h-full bg-gradient-to-r from-orange-600 to-[#ff843a] rounded-full shadow-[0_0_8px_rgba(245,73,0,0.2)]"
              />
            </div>
            <p className="text-[11px] text-gray-400 font-bold">5,150 pts until Platinum Status</p>
          </div>
        </div>
      </section>

      {/* Dropdown Filter */}
      <div className="relative z-40 w-full sm:w-64">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-white border border-gray-200 text-gray-800 px-5 py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-between hover:bg-gray-50 transition active:scale-95 duration-200"
        >
          <span>{activeTab} Rewards</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {dropdownOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in duration-200">
              {["Available", "Claimed", "Redeemed", "Expired"].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-xs font-bold transition-all ${
                    activeTab === tab
                      ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Rewards Grid (Side by side on all sizes) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 pb-24">
        {filteredRewards.map((reward) => {
          return (
            <div
              key={reward.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-200 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group min-h-[200px] sm:min-h-[220px]"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-150 p-1.5 sm:p-2 flex items-center justify-center overflow-hidden shrink-0">
                    <img className="w-full h-full object-contain" src={reward.logo} alt={reward.title} />
                  </div>
                  {reward.tag && (
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                      {reward.tag}
                    </span>
                  )}
                </div>
                <div className="mt-3 sm:mt-4 space-y-1">
                  <h3 className="text-xs sm:text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 sm:line-clamp-2">
                    {reward.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed max-w-sm line-clamp-2 sm:line-clamp-3">
                    {reward.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <div className="flex flex-col text-[9px] sm:text-[11px] font-bold">
                  <span className="text-orange-600">Value: {reward.value}</span>
                  <span className="text-gray-400">Expires: {reward.expiry}</span>
                </div>
                {reward.status === "Available" ? (
                  <button
                    onClick={() => handleRedeem(reward.id, reward.title)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl active:scale-95 transition-all shadow-md shadow-orange-600/10 text-center"
                  >
                    REDEEM
                  </button>
                ) : (
                  <span className="text-[9px] sm:text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg sm:rounded-xl text-center">
                    {reward.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredRewards.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="p-4 bg-gray-50 rounded-full inline-block mb-3 border border-gray-100">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">No rewards in this category.</p>
          </div>
        )}
      </div>

      {/* Bottom Nav Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
        <Link href="/participant" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/participant/market" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">storefront</span>
          <span className="text-[10px] font-bold mt-0.5">Market</span>
        </Link>
        <Link href="/participant/wallet" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span className="text-[10px] font-bold mt-0.5">Wallet</span>
        </Link>
        <Link href="/play-win" className="flex flex-col items-center justify-center bg-orange-100 text-orange-600 rounded-full px-4 py-1 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
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
