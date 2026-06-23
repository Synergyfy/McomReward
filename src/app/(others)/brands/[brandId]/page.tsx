"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ brandId: string }>;
}

const brandDetailsData: Record<string, {
  name: string;
  category: string;
  rating: string;
  banner: string;
  logo: string;
  desc: string;
  rates: { name: string; rate: string; icon: string; bg: string; desc?: string }[];
  offers: { name: string; desc: string; image: string; tag?: string }[];
}> = {
  "luxe-avenue": {
    name: "Luxe Avenue",
    category: "Luxury Fashion",
    rating: "4.9",
    banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuByDrSiFlOt8977X42WZdCI-_KFFgoGRy_JteGgl3VGU5VKdk8n4kmTEmBHSdiY4XNgeJ2JkCApSTkwZF7R6whBQjJ-CXIDvmAds47u6bY3bcsL38DqDjzqxEqYk5jWPzVv5o1inKL4SFT9UpVvUvMn68iWTnjZkqvMOwrrTgvOCPbnIC_eoYECjDl1eZ10kzo9uWyINfCqeYuIWDTgRBorQivPlD8XNF8PmUgIsN1xCH1nmhTU1sswr-6lk1uoGpHyG66Yx5FPTFOc",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB83BZEE2BGyotHyBpLqZ8fyPAICwRB6gy_ad7r9fLznUgbL7HO1jbSbqZyjPHmHDOs2x3cv9-0RJs5aMhKZncyFyQp7PM643nW6YCXPwgYJsEjGhHaThU4g7eqI_JHFwjX_nhLPtga09pUfoKAR5SOo4Zx225anqVUCrDNff4EanE8fsYsUaGnylvA9R0lLk2zpW-BMmhW7VlYCzjsKRePZYBo-XHibSG1yoZ1J0ENyHxW48ewzJ-h1fYwrNzJtUr91bbX4ftxBNFz",
    desc: "Luxe Avenue has defined modern elegance for over two decades, curating a selection of high-end apparel, accessories, and home goods that speak to the sophisticated individual. Known for their commitment to quality and ethical sourcing, they offer a shopping experience that is both rewarding and conscious.",
    rates: [
      { name: "Standard Shopping", rate: "5% Cashback", icon: "shopping_bag", bg: "bg-orange-500" },
      { name: "First Time Purchase", rate: "12% Cashback", icon: "new_releases", bg: "bg-amber-500", desc: "Exclusive for new members" },
      { name: "Luxury Accessories", rate: "3% Cashback", icon: "watch", bg: "bg-slate-500" }
    ],
    offers: [
      { name: "Extra 20% Off Footwear", desc: "Apply code LUXE20 at checkout for additional rewards.", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtWCJ8gIltXPUpYM8Kdza2t4s2pMr3hi_LKr2M0G3DSt4NVLI-qMY4ELkhrQ7JY9sj3gDupEAOKhWFMF_AD5h7rZZz7bSqSJawjjavM6M2ANOcr2JHnXo7c4Mm73M-sw8_IMUIs9JVa6xS5ul9-qEvjmTOYomv_VCDQBEJ8TNIfyFpvaDoN3m2z-p9XzSr85R3lNXC6vfsYDKl0WO6KzMcBbijFqELEMC63rQK9aCyPL1qfEX1Nc8T7mwXUD7ReGtBz9v_63Y393Xe", tag: "ENDING SOON" },
      { name: "Home Decor Event", desc: "Earn double points on all premium home collection items.", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBN_dWpmVv45dAed7pkKvIfFg2x8aWfXh2v63VVrwhPzyWwferj6yD-ehKKnyavoYPAuK09l2Me0xgoNEj2rC2jES_UBP-tZ_EkQo_8Whr74j01M8WJ5BfE8ZN4LluudgjYaks9yjjPSG_MJKqHdao3xg2bfWab4qskzkzBq-S7bEM4pMtEe7L7cZl4s8cFqTc2KV9dVxlxYmh3kSSmtgNl8PWoxY_O6_TxjnKoxmWj5_8Fo7WfQtgVIjBFHQMtHbqs6aRID2OlWUzp" }
    ]
  }
};

const relatedBrands = [
  { name: "Aura Athletic", rate: "4% Cashback", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCg9DAbufrr_5NH1NQB9NBgTn40x84Vfs1u-X44R8cKZ7Zp72qMMtLQquDCuN7tMULpGbEPNERPuVbdIN_VGeOeuGES1TNL4ipcbRXS-EH614TGFXSPuJgKx2tHbjHwULUAysCUFD1zKiAQuJ2ZDrjcGTXQ5rDoa0jnBzWHYAPOB3Zcx1VlQW92F_VEXuBtOC6VF-elipLYmDEE7d86B5EXCSu0gVNNkCsP-r4ubRPlMFH5HDEu8U_BCsECBHpfMsJxZBmDfuqi7OK6" },
  { name: "Velas Skin", rate: "8% Cashback", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0YqX6xQNotzyWMO2npLezkvgl5IoGjBfLtuJliDCm4iYtVWx4xkZlaWvihVTn02S3UeEdDMRHIGzOsEFaHEpjZKiwqjAEw0PZJd4dtrSjWvpPGS88yhlyVDlXc9SAQtdalx6CdS7OX2ZgNhj_1PViayBJEOpZDhb3nro7vq9GZWRhlOkHcaiUj_3UAYOUuJj9ztF7CGt3j3LcmB_vfEzkmEGSa9DlClY_eShxvq6D0j2Ffhqi7DFB9QhvKbxRHeJ020bf7fqG8smA" }
];

export default function BrandDetails({ params }: PageProps) {
  const { brandId } = use(params);
  const [denom, setDenom] = useState(100);

  const brand = brandDetailsData[brandId] || brandDetailsData["luxe-avenue"];

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      
      {/* Hero Section Banner */}
      <section className="relative overflow-hidden rounded-3xl h-[280px] md:h-[360px] flex items-end">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${brand.banner}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent z-10" />
        
        <div className="absolute bottom-6 left-6 z-20 flex flex-col md:flex-row items-start md:items-end gap-4 text-white">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center p-3 border border-gray-100 shadow-lg shrink-0 overflow-hidden">
            <img className="w-full h-full object-contain" src={brand.logo} alt={brand.name} />
          </div>
          <div className="space-y-1 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{brand.name}</h1>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full">{brand.category}</span>
              <span className="bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {brand.rating} Rating
              </span>
            </div>
          </div>
        </div>

        <button className="absolute bottom-6 right-6 bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-xs shadow hover:bg-orange-50 active:scale-95 transition-all z-20">
          Follow Brand
        </button>
      </section>

      {/* Main Grid Content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns - About and Rates */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* About */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">About the Brand</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{brand.desc}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
              {[
                { icon: "local_shipping", label: "Fast Delivery" },
                { icon: "assignment_return", label: "Easy Returns" },
                { icon: "verified_user", label: "Authentic Only" },
                { icon: "support_agent", label: "24/7 Support" }
              ].map((feat, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-orange-500 text-xl">{feat.icon}</span>
                  <span className="text-[10px] font-bold text-gray-700">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rates */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-orange-500 p-5 flex justify-between items-center text-white">
              <h2 className="font-bold text-base">Cashback Rates</h2>
              <span className="bg-white/20 text-white px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                Updated Today
              </span>
            </div>

            <div className="p-5 space-y-3">
              {brand.rates.map((rate, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">{rate.icon}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">{rate.name}</span>
                      {rate.desc && <span className="text-[9px] text-gray-400 font-bold">{rate.desc}</span>}
                    </div>
                  </div>
                  <span className="text-orange-500 font-bold text-sm">{rate.rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Offers */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Active Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {brand.offers.map((offer, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm group hover:border-orange-500/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-2xl overflow-hidden h-40 mb-4 bg-gray-50">
                      <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                           src={offer.image} alt={offer.name} />
                      {offer.tag && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {offer.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{offer.name}</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5 line-clamp-2">{offer.desc}</p>
                  </div>
                  <button className="w-full py-2.5 bg-gray-50 text-gray-600 hover:bg-orange-500 hover:text-white rounded-full font-bold text-[10px] mt-4 transition active:scale-95">
                    Activate Reward
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Gift Cards and Related */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Buy Gift Cards */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Buy Gift Cards</h2>
            
            {/* E-Gift Card Preview */}
            <div className="relative h-40 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white flex flex-col justify-between overflow-hidden shadow">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs opacity-90 uppercase tracking-widest">E-GIFT CARD</span>
                <span className="material-symbols-outlined text-2xl">contactless</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] opacity-75">{brand.name} Rewards</p>
                <p className="text-2xl font-extrabold">£{denom}.00</p>
              </div>
              {/* Background glow overlay */}
              <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Select Denom */}
            <div className="space-y-4 pt-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Select Amount</label>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map((val) => (
                  <button 
                    key={val}
                    onClick={() => setDenom(val)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      denom === val 
                        ? 'bg-orange-50 text-orange-600 border-orange-500' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    £{val}
                  </button>
                ))}
              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition duration-200">
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                Purchase Now
              </button>
              <p className="text-[10px] text-center text-gray-400 font-semibold">Instant delivery to your MCOM Wallet & email.</p>
            </div>
          </div>

          {/* Progress widget */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">military_tech</span>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Your Progress</p>
                <h3 className="font-bold text-xs text-gray-800">Platinum Tier</h3>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-[75%] rounded-full" />
              </div>
              <p className="text-[9px] text-gray-400 font-bold text-right">750 / 1000 pts to next reward</p>
            </div>
          </div>

          {/* Related Brands */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Related Brands</h2>
            <div className="space-y-3">
              {relatedBrands.map((rel, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all cursor-pointer group shadow-sm bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                      <img className="w-full h-full object-contain" src={rel.image} alt={rel.name} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-800">{rel.name}</p>
                      <p className="text-[10px] text-orange-500 font-bold">{rel.rate}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-0.5 transition-transform text-sm">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </section>

    </div>
  );
}
