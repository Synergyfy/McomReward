"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ["All Brands", "Fashion", "Travel", "Entertainment", "Food", "Tech", "Home", "Beauty"];

const featuredBrands = [
  {
    id: "luxe-avenue",
    name: "Luxe Avenue",
    category: "Fashion",
    cashback: "Up to 25% back",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB83BZEE2BGyotHyBpLqZ8fyPAICwRB6gy_ad7r9fLznUgbL7HO1jbSbqZyjPHmHDOs2x3cv9-0RJs5aMhKZncyFyQp7PM643nW6YCXPwgYJsEjGhHaThU4g7eqI_JHFwjX_nhLPtga09pUfoKAR5SOo4Zx225anqVUCrDNff4EanE8fsYsUaGnylvA9R0lLk2zpW-BMmhW7VlYCzjsKRePZYBo-XHibSG1yoZ1J0ENyHxW48ewzJ-h1fYwrNzJtUr91bbX4ftxBNFz"
  },
  {
    id: "artisan-coffee",
    name: "Artisan Coffee House",
    category: "Food",
    cashback: "Elite Partner status",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpN2nAYiIYXfgnYOwvw4WDZondTITWQgtSgb7l8vodmd8HCbDiek6h4Rsf3JcDI82vRsfynrX0Z2CE32kN2HaCbUXqaWuuHaxUW5gZj5bAsCSLrx5CE0IuZr_iGzGHqPHlulEMxYlnRNe8gg9rKbP3iKaqKPzGWUCL4YkAVHGZ-thg9M1_68WPBhvh_cr-afaqpoxI5uWLsS5aoKu0aj9FDSstIfUi67E4sa6uWPmuR77KgJePGHjthAwapjRBCKsQJAmXzy9zurY7"
  },
  {
    id: "techpulse",
    name: "TechPulse",
    category: "Tech",
    cashback: "Up to 12% back",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhn57Hj_t8cpcjZuPvTufq7-YMafF1_O71bOcoKsMG5RfWKFn_vh_szZ4Z_3eTpMU7dbuKa6ZBhVAinJ1dXF45FoUjOlvkvTY4WZrmWQg7EUqfuXoeXto0HNnILYkTuZyGCnGtPuQ-jYCd2cm7SxccASXvF-JR1Sa_Z71cwBqCQHamL7xnk_Jy9rETfOsv9ji6bpdZUj6j4kFZ1NUYKdH93h_BqYapGEp_dcDEajRG6j-6b2SCS250L4G2mwZZw7PsbPDCmBg62sbD"
  },
  {
    id: "haven-home",
    name: "Haven Home",
    category: "Home",
    cashback: "Up to 18% back",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjTkXaT-GcECRMZpbbbdlb5ACkz5IqN_Mv1fvD1r87AXlYwM7hg0fscYnWzjc6bBE_tVQZ2gcKsCYV-pkwYN1Y7K9pFr9lnprs9GxyfGQntLkba7As6_DtMZVjSsH94ZI4H33cqQWxL04AZQwFiF8lZ-yOHfIvi6TSVsAX0HZbzRjAv-JzgcZ9ONjv6yacZnSkTUbqyXkksxlAhLTDXN_ecm1nphEIO2Z8A6xocKfBMuWRSinHkdfg-m_ji1PdDEyBy-FxmMZKjz3w"
  },
  {
    id: "skybound",
    name: "Skybound",
    category: "Travel",
    cashback: "Up to 20% back",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDh4YKJGiEpoCj6ewsrW9hfojSMr-Calv-WNkA01FIQdv_-L4LjPHc2qkDISS0XfP_n-EHPzyuuV-3DvE3JGOz8nGrNxatI7LeXVJ8EdKzpKFpWlHZC75hpHY88WVSE1N6G1N7Y2qQIwCoTxf3taEvhYYBjUySTwpJqGU6retEA1RQ7EUEEil9seDm5xlSjBLxmdXiHCfgSwYyKBR3y-4X6MCptce-sPzcy6PTkHioMWmpdq-hFu1hscDESGK1R7YiLNL0A8FV7i61E"
  }
];

const popularBrands = [
  {
    id: "nike",
    name: "Nike",
    category: "Fashion",
    offer: "Get 8% Cashback + 2x Points",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp48G7lQWvtSKokkqAHV9R8g_aF-TpcLs-7aeg19j2d98-vN5oevc-DSJcPzQ-dhvcooatfVWwiNfJ6dJrUmFFX27T0XApn_1wadHTta5se4Tf4dSzQbsw-lTexbvOdzwgws111mGjrEvKwGHRuZR5h_qXB6BECqRUISS_reOSUic6c903RroU19xddOoz5uArE_9tFhFw5S7rnQsGsOt_BDk_zwTEO3mS-YH7TSbs2KeCeofnayROJijGQFnNzXViFPunR2g74EmD"
  },
  {
    id: "uber",
    name: "Uber",
    category: "Travel",
    offer: "10% Cashback on Premium Rides",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZWmbKDgtapuXSFwPnJic0N42gteMRNnsyxKs8gvtgE2pk6XbeHhOBymnw4YG9loBurwA7qu81PtvkFhvsDEd0pzhLIzbmKuLDHOsWUc33h_r9qs75SFb588DURbd5eeW67_2GawGjhR4Iar7ujXQYLI1qY1XUQRMC7DBf1rXsMR8jszfxrWhbETFPX5DO9HVDm-tWw14V48R0J6YoEysJRNqKo-0kBY4Ax8nB2Jlz-fARySvr8phhFI7toYfjYd9iBfrmaqSdu0l"
  },
  {
    id: "starbucks",
    name: "Starbucks",
    category: "Food",
    offer: "Free Drink stamp on £15 purchase",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdkmAd7VVkI6d-BJeXPo_t8uBGn7gBj294OFMvuRMFSg5p2R7Dg2yg1Xv5I7MwHfQNZz24rbU-VA-tEztYWdYvw-ydWeHm84gEy4Aj_oW1ZisZn_wD2-zbmsZXYjwT7tuF9bYqnvGy6xZ-GDev8_h81I22CYq5TMvKoJ6My797vdXP-3-m48RhhnAUKIrdXY_rIAt8QpphqWupMutcIfFilORPTyNeVrN-q0Ne246KfoaeuZl7FLxLHwBLhwAGouxc8W62xamOUPvy"
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "Entertainment",
    offer: "5% cashback on monthly subscription",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoGqlIRuED0GO8fjmsjsbbcxBRIw57gBdUCqsoTV7YMizjczo-bpemEaPCcEqCdZ-WWBaj4rqOwiYfsVDTkkGizzh9_6qiTRxeKpOZb_qbDeqg5x92Ne6BVyZ6G7gri_u2DBt-b7-pjKQYUDviMGvLO3-NHhKZMDzkDNNWLxFwJxNM0WRG_h5pXgWgT7GdFZQ5BXYJT56ChhOflZd6C4GUjffodGZ5lVDla-Xa1vZ1jpGlDmsAUD9666IZefXkUAebhNsxibabZyiG"
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "Tech",
    offer: "Up to 5% Cashback + Free Points",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAivVTAvQ1_GqV_dr7iW0m79Y-BR1t2kkFUSb0eXobTt9hRXBs2F0hu_cR1cevnqxLNEkD1xldkNUYXyOxt69siXh3KL_mg0f040kONjnLPSJYTYU3oJF-H_Gf2pyO4olyJM7sYUn0qYBQcHgRRiBtGcOBKgUCX77T2P0_0HfnJZSWEJxE5U44nXBnXRsYHiT-dRmON8u4GNXaUsc_QRq7ZLoESmZiR0hJabV_d-iGF_2nyinNDQZj4yrblpEQZzmVTTb31wlWPYu1b"
  }
];

export default function BrandsMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All Brands");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredFeatured = selectedCategory === "All Brands"
    ? featuredBrands
    : featuredBrands.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  const filteredPopular = selectedCategory === "All Brands"
    ? popularBrands
    : popularBrands.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6">
      
      {/* Hero Section: Asymmetric Bento */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Highlight Card */}
          <div className="md:col-span-8 relative overflow-hidden rounded-[32px] bg-orange-500 p-8 min-h-[360px] flex flex-col justify-end group shadow-lg">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 text-white max-w-lg space-y-4">
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                Featured Brands
              </span>
              <h1 className="text-3xl md:text-5xl font-bold font-headline-lg leading-tight tracking-tight">
                Exclusive Deals. Up to 25% back.
              </h1>
              <p className="text-sm opacity-90 leading-relaxed">
                Shop your favorite premium labels and earn massive rewards on every purchase through the MCOM ecosystem.
              </p>
              <div>
                <button className="bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold text-xs hover:scale-105 transition active:scale-95">
                  Explore All Brands
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Hero Card */}
          <div className="md:col-span-4 rounded-[32px] bg-amber-500/10 border border-amber-500/20 p-8 flex flex-col justify-between group overflow-hidden relative shadow-sm min-h-[300px]">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline-lg text-amber-900">Limited Offer</h2>
              <p className="text-xs text-amber-800/80">Double rewards on all Tech brands this weekend.</p>
            </div>
            <div className="space-y-1">
              <span className="text-4xl font-extrabold text-orange-600 tracking-tight">+15%</span>
              <p className="text-xs font-semibold text-amber-900">Extra Loyalty Points</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all duration-700" />
          </div>

        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="hidden md:block mb-8 sticky top-16 z-40 py-2 bg-surface-bright/90 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Partners */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6 relative">
          <h3 className="text-2xl font-bold font-headline-lg text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">verified</span>
            Featured Partners
          </h3>
          
          {/* Desktop "See All" Link */}
          <span className="hidden md:inline text-orange-500 font-bold text-xs hover:underline cursor-pointer">See All</span>

          {/* Mobile "See More" Dropdown Selector */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-orange-500 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{selectedCategory === "All Brands" ? "See More" : selectedCategory}</span>
              <motion.span 
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="material-symbols-outlined text-xs font-bold"
              >
                expand_more
              </motion.span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl z-20 w-44 overflow-hidden divide-y divide-gray-50"
                  >
                    {/* "See More" mapping to "All Brands" */}
                    <button
                      onClick={() => {
                        setSelectedCategory("All Brands");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                        selectedCategory === "All Brands" ? 'bg-orange-50 text-orange-600' : 'text-gray-600'
                      }`}
                    >
                      <span>See More</span>
                      {selectedCategory === "All Brands" && (
                        <span className="material-symbols-outlined text-orange-500 text-xs font-bold">check</span>
                      )}
                    </button>

                    {/* Other category filters */}
                    {categories.filter(cat => cat !== "All Brands").map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                          selectedCategory === cat ? 'bg-orange-50 text-orange-600' : 'text-gray-600'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && (
                          <span className="material-symbols-outlined text-orange-500 text-xs font-bold">check</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div 
            layout 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {filteredFeatured.map((brand) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={brand.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center group cursor-pointer shadow-sm hover:border-orange-500/20 hover:-translate-y-1 transition-all"
              >
                <Link href={brand.id === 'artisan-coffee' ? `/merchants/${brand.id}` : `/brands/${brand.id}`} className="flex flex-col items-center text-center w-full h-full">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform overflow-hidden p-3 border border-gray-100">
                    <img className="w-full h-full object-contain" src={brand.logo} alt={brand.name} />
                  </div>
                  <h4 className="font-bold text-base text-gray-800 mb-1 hover:text-orange-500 transition-colors">{brand.name}</h4>
                  <span className="text-orange-500 font-bold text-xs mb-2 block">{brand.cashback}</span>
                  <span className="px-3 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[9px] uppercase tracking-wider font-bold">
                    {brand.category}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Popular Right Now */}
      <section className="bg-gray-50 rounded-[40px] p-8 md:p-12 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h3 className="text-3xl font-bold font-headline-lg text-gray-900 mb-2">Popular Right Now</h3>
            <p className="text-xs text-gray-500 max-w-xl">Join thousands of members shopping these top-trending brands this week.</p>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div 
            layout 
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {filteredPopular.map((brand) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                key={brand.id}
                className="bg-white p-3.5 md:p-5 rounded-3xl border border-gray-100 flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link href={`/brands/${brand.id}`} className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3 md:gap-4 w-full h-full text-center sm:text-left">
                  <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl overflow-hidden bg-gray-50 p-2 border border-gray-100 flex items-center justify-center">
                    <img className="w-full h-full object-contain" src={brand.logo} alt={brand.name} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-xs md:text-base text-gray-800 hover:text-orange-500 transition-colors truncate">{brand.name}</h4>
                    <p className="text-[10px] md:text-xs text-orange-500 font-semibold leading-tight">{brand.offer}</p>
                    <span className="inline-block bg-gray-100 text-gray-500 text-[8px] md:text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                      {brand.category}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

    </div>
  );
}
