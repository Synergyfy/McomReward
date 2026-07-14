"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const faqCategories = [
  { icon: "shopping_bag", title: "Orders & Shipping", desc: "Track deliveries, change addresses, or manage returns." },
  { icon: "wallet", title: "Payments & Billing", desc: "Billing cycles, credit cards, and invoice management." },
  { icon: "workspace_premium", title: "Membership", desc: "Tier benefits, reward points, and elite status." },
  { icon: "security", title: "Account Security", desc: "Two-factor auth, passwords, and data privacy." }
];

const faqs = [
  {
    q: "How do I redeem my points for travel?",
    a: "Redeeming your MCOM points for flights or hotel stays is simpler than ever. Navigate to the Rewards dashboard, select 'Travel Hub', and choose your destination. Your current balance will automatically apply as a discount at checkout."
  },
  {
    q: "Forgot my PIN?",
    a: "You can reset your security PIN instantly via the mobile app under Security Settings or on the account management dashboard.",
    action: "Reset now"
  },
  {
    q: "How do I track my points cashback?",
    a: "All cashback and point accruals are visible under your MCOM Wallet transaction history. Pending amounts settle in 48 hours."
  }
];

export default function FAQHelpCenter() {
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-16">
      
      {/* Hero Search Section */}
      <section className="bg-gray-50 border border-gray-100 rounded-[40px] p-8 md:p-16 text-center space-y-6 shadow-sm">
        <h2 className="text-3xl md:text-5xl font-bold font-headline-lg text-gray-900 leading-tight">
          How can we help?
        </h2>
        <div className="max-w-xl mx-auto relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input 
            type="text" 
            placeholder="Search for rewards, orders, or policies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 focus:border-orange-500 focus:ring-0 rounded-full text-sm shadow-sm transition-all outline-none"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-gray-500">
          <span>Popular:</span>
          <button onClick={() => setSearch("track")} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full">Track Order</button>
          <button onClick={() => setSearch("PIN")} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full">Reset PIN</button>
          <button onClick={() => setSearch("membership")} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full">Membership Tiers</button>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold font-headline-lg text-gray-900">Browse by Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {faqCategories.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-600">
                <span className="material-symbols-outlined text-xl">{cat.icon}</span>
              </div>
              <h4 className="font-bold text-sm text-gray-800 mb-2">{cat.title}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Priority support banner */}
      <section className="bg-neutral-900 text-white rounded-[40px] p-8 md:p-12 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl space-y-4 z-10">
          <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Priority Support
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-headline-lg">Elite & Business Solutions</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Dedicated account managers and 24/7 technical assistance for our high-tier members and business partners.
          </p>
          <div className="flex gap-2 pt-2">
            <Link href="/membership" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs shadow transition active:scale-95">
              Upgrade to Elite
            </Link>
            <button className="border border-white/20 text-white hover:bg-white/10 px-5 py-2 rounded-full font-bold text-xs transition active:scale-95">
              Business Portal
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/10 shrink-0">
          <img className="w-full h-full object-cover" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6qFayc89SCIK3U8FbhX_XhKW9uZn4YNCg3n-houl04eq1l0vPSlDvis3iuz4BgNLi-4hgakolBUG5su82FnS6Anfyd0W7pr0-L8fgOXjC8qN8l63Z5dPCD_I7zqP9KzKGDFWfj5N0u1vewMhWCddY1vUxMvf0ZXzofdGFDiyq0_PlwQ9fOnK2zUNxuk-tuKhrxrqgEfeFcej91WDVgEfVgJo-1PgqSArcPlAvDnOzid6ki5zoG3ucljUH1f__nz7ny6YFde-qLE23" 
               alt="Corporate support desk office" />
        </div>
      </section>

      {/* FAQ Common Questions */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold font-headline-lg text-gray-900">Common Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-150 flex flex-col justify-between hover:shadow-sm transition-all shadow-sm">
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-800 leading-snug">{faq.q}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
              <div className="pt-6">
                {faq.action ? (
                  <button className="text-orange-500 font-bold text-xs hover:underline">{faq.action}</button>
                ) : (
                  <span className="text-orange-500 font-bold text-xs flex items-center gap-1 cursor-pointer group hover:underline">
                    Read guide <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
