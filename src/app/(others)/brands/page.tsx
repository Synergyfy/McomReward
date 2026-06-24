"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Star, ArrowRight, ChevronLeft } from 'lucide-react';

const categories = ["All Brands", "Fashion", "Tech", "Travel", "Beauty", "Home"];

const brandsData = [
  {
    id: "nike",
    name: "Nike",
    category: "Fashion",
    cashback: "Up to 10% Cashback",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ48UrlbL1g30kbVrOcXO_AQfnOYkrCYkRFqjIHgto5ohYsNN9Fp6YS3UQbGyyna8EPQkt-IrfmxpMLZUaXkkSWGFtz4VuHWF1v-l9rfXMLHDFZsz6cCh1b_p1_ofHVJ88M06kPzd-4tufBUbJ9O_FlYpKbkVwKq99eNlMlIkv7uHaMCfoKXLVZgcWo_qT7DPBhZ-jEH2fNypXwN0JuiZxMR4X9VFfV-B24yQNVOMt2MA-9Dai9X51gSiAzY3nNkdRhjlFFl1DywA",
    bgColor: "bg-white"
  },
  {
    id: "apple",
    name: "Apple",
    category: "Tech",
    cashback: "5% Cashback",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBidYnMTj_B204xeYGxYUHQXaMLHF2mTSLSWbDfNkiV94ys5Bmx-zFCLM0lZnohMB8LOMgvVdDr-xgt6unBBRewHNk0qFGFEeCLCJkO5GGUeJEgKEbD58_vi_Dk3n6rcdClzf8VvdyemmNfiJmbAbEPTVSr2UOKPFvrg5PWiafDaD6QpbRT95Yjd6r3qWYgoRcn2-nkHQyn3bWmVXW79QkaxU9JA3dpHIJIlrihjYA6EgqIHfg4o4ipsQ8y6ItU8ZapDJn1iYY1PXo",
    bgColor: "bg-white"
  },
  {
    id: "sephora",
    name: "Sephora",
    category: "Beauty",
    cashback: "8% Cashback",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtTryZ7O1js8jdpZn2en9_C5jGnvJrlfXyAk3EB2xPeyAu6favewsk_VgnZi8KCtsBZlk88vEiHhNCs7FHoOVvQLI4GqW0T1QHfpCwhtf9Dd0uOUcWWb6E088ZdEwcR2VYz66FyZ2E3m198X03GRhFFRfzsUhGqlUVuN72bL-UEVHFS3N0NGMGaELV9l64Hkmrh0WzKM9CkDiYbE7HT1OwOp8bbHK2gtt5jwppXfL7e-Bqa-NQ4J8A46cdgcVFWkWXOWfLt5alHWw",
    bgColor: "bg-gray-50 border border-gray-200"
  },
  {
    id: "airbnb",
    name: "Airbnb",
    category: "Travel",
    cashback: "4% Cashback",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWm5rQE5G2K4QR53CsF0RbYaZkYCrOAs2q9Q8QhjE6FexLkbThYHqdFHOto4JlEVJ7DnSiFP6_HCPo4VFsf7kDzborsLxod3WhLiCeO31EvdufxMQfc2zW-jdJVw5PE9Kf8vzBA-k9BKwqSoTBcSUycokP93sqk48UofW4oN67xQBMkqMrdg9V9LXsJiuYRX7d2IaeXGdF1XSj2HNjl4mbBmp6enTlPRATShmUaPpFPOFkjPeZwTIEiWnnrdtZ1FNEDyQwoROcgFA",
    bgColor: "bg-white"
  },
  {
    id: "adidas",
    name: "Adidas",
    category: "Fashion",
    cashback: "Up to 7% Cashback",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6LeKteFeeTM-OQVyzay82rTi1aX7tyOtq7alktmCo_dUzUaj-Q3Lh9CQITbexbfH_8WOPiu-lwde9gQDHK3xBEbWbMJoAjdPRDG-ehdezV1qV8EhBmTiBecmJ47LsMljp-9Rv6Zf9L2PJuuJ7QaBGPOFBIKKM0VvvkYtsw2Sx3ZLDDMeflv-kp-l7rDQu9wIk3ZD1n9utak2ZR2Y2tYMWtibunwqug2jSOaL_hNQ5wQX0LO_ET4KRFsH7UkTTHoa5vPN8Ez3OOPc",
    bgColor: "bg-white"
  },
  {
    id: "farfetch",
    name: "Farfetch",
    category: "Fashion",
    cashback: "6.5% Cashback",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAF975FP-IOHkLjzlqeNX55JhFeGm_Y3qZC2oD-QfQUHMIxaPlSC0RkuTwKXB6L-zT7z0i8-Y-FjdWaF_nOocwfeanl09GqDp0OtLR4PcBq3VU_CKCX_o45awBk3ZtBxKN26VIcx_NAKzud7UH34mW_x68qJwbld50yDTMN5yZCd2j5FaP0phbW5DO7FNc7S_uRJ4gakBv4xFPabrmAMcqqPFD_1fCBwa4Ddwowy-c9xzJJwmgGFJH-TSW1Sl9CTcyOA_BZ_5LwRSI",
    bgColor: "bg-black"
  }
];

export default function BrandsMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All Brands");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = brandsData.filter((brand) => {
    const matchesCategory = selectedCategory === "All Brands" || brand.category === selectedCategory;
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

      {/* Brand of the Month Banner */}
      <section>
        <div className="relative w-full h-56 rounded-3xl overflow-hidden shadow-md group border border-gray-100">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGCHUjr8eBa-imslrrNDsiANhOcp2qCRUjlwy3M_z0iOexsIUvSPBOg2FzX0hbXdS6ZL89jPSUixGheN33T9cvz6n93RPMSYb9xIuXzYr85gGDlTaZ-Y8rnT5pNk0sRM9S4CgJwu2tqOyz8oxUUzXpW7M8WyeEbKG3i0hM57dLtzk1OSUZL-B5mv1W1r6FOAZs2kBV9xg6zhCAhr5Rz33ERxIyHX2G8KS77voWu6q4uYbZiJZDPCh2YLRkNeg7Ud6aIC8A4_Gf3nc')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block shadow-sm shadow-orange-600/20">
                BRAND OF THE MONTH
              </span>
              <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">Apple Luxe</h2>
              <p className="text-sm font-semibold text-orange-400 mt-1">Exclusive 12% Rewards</p>
            </div>
            <Link href="/brands/apple" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm text-center shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

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

      {/* Brands Grid (Bento/Asymmetric Style) */}
      <section className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-2 sm:space-y-4">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 ${brand.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center p-1.5 sm:p-2.5 overflow-hidden shadow-sm`}>
                <img className="w-full h-full object-contain" src={brand.logo} alt={brand.name} />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight truncate">{brand.name}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-orange-600 mt-1 truncate">{brand.cashback}</p>
              </div>
            </div>
            <Link
              href={`/brands/${brand.id}`}
              className="mt-4 sm:mt-6 w-full text-center bg-gray-50 text-orange-600 hover:bg-orange-600 hover:text-white border border-orange-500/20 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-98"
            >
              Shop Now
            </Link>
          </div>
        ))}

        {/* Featured Large Card: Dyson */}
        {("All Brands" === selectedCategory || "Tech" === selectedCategory) && (
          <div className="bg-white rounded-3xl p-0 overflow-hidden col-span-2 border border-orange-500/25 shadow-md shadow-orange-500/5 group">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/3 h-48 sm:h-auto overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWTs4WeLCQLrEy7bbqfMzXFpDjnI7Pj-97FMNDZ5CEQE0YJdcYVN5iuaML5eKPk6xbtS4iL-464mRplmXijRnsoRbYQ1G12WI1vDoyBR8W61ToQvUipC45zTCyVIfX5wqm4Wmk_uWs_nKsC8imb4S6KwaEs_YbrmWTKtqH1lxq3e7jQtpOEd-PIwzib5z-HdYaELChJyt1rFVO5bz9s2gtQ3vbf3TVjvVxUOKLxkAdUCzKxg3QVCE8p5jXAi838uMOy21O70L85tQ"
                  alt="Dyson"
                />
              </div>
              <div className="p-4 sm:p-8 flex flex-col justify-center flex-1 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-1 text-orange-600">
                  <Star size={12} className="fill-orange-600" />
                  <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">FEATURED PARTNER</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-extrabold text-gray-900 mb-1">Dyson Technology</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                    Experience the next generation of engineering with exclusive 15% cashback for Gold Members.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-lg sm:text-2xl font-black text-orange-600">
                    15% <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Cashback</span>
                  </span>
                  <Link href="/brands/dyson" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs shadow-lg shadow-orange-600/10 active:scale-95 transition-all">
                    Shop Dyson
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Coming Soon Panel */}
      <section>
        <div className="bg-orange-600/5 rounded-3xl p-6 flex flex-col items-center text-center border border-orange-500/10 space-y-4">
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-orange-600">Coming Soon</h4>
            <p className="text-xs text-gray-500 max-w-md">
              New exclusive partnerships with Luxury Travel brands arriving next week.
            </p>
          </div>
          <div className="flex items-center -space-x-3">
            <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">AA</div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">LH</div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-400">BA</div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-orange-600 flex items-center justify-center text-white text-[10px] font-extrabold">
              +8
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

