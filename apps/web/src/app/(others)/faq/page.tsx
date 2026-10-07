"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetHelpCenterArticles } from '@/services/help-center-articles/hook';

const CATEGORY_ICONS: Record<string, string> = {
  default: "help",
};

export default function FAQHelpCenter() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetHelpCenterArticles({
    page: 1,
    limit: 50,
    title: search || undefined,
    category: activeCategory || undefined,
  });

  const articles = useMemo(() => data?.data ?? [], [data]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) {
      if (!a.category) continue;
      map.set(a.category, (map.get(a.category) ?? 0) + 1);
    }
    return [...map.entries()].map(([title, count]) => ({ title, count }));
  }, [articles]);

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
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 focus:border-orange-500 focus:ring-0 rounded-full text-sm shadow-sm transition-all outline-none"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-gray-500">
            <span>Popular:</span>
            {categories.slice(0, 3).map((c) => (
              <button
                key={c.title}
                onClick={() => { setActiveCategory(c.title); setSearch(""); }}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold font-headline-lg text-gray-900">Browse by Category</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">No help categories yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.title}
                onClick={() => setActiveCategory((prev) => (prev === cat.title ? null : cat.title))}
                className={`bg-white p-6 rounded-3xl border flex flex-col items-center text-center group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${activeCategory === cat.title ? 'border-orange-500 shadow-md' : 'border-gray-100'}`}
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-600">
                  <span className="material-symbols-outlined text-xl">{CATEGORY_ICONS[cat.title] ?? CATEGORY_ICONS.default}</span>
                </div>
                <h4 className="font-bold text-sm text-gray-800 mb-2">{cat.title}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">{cat.count} article{cat.count === 1 ? '' : 's'}</p>
              </div>
            ))}
          </div>
        )}
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
            Dedicated account managers and technical assistance for our high-tier members and business partners.
          </p>
          <div className="flex gap-2 pt-2">
            <Link href="/business" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs shadow transition active:scale-95">
              For Businesses
            </Link>
            <Link href="/contact" className="border border-white/20 text-white hover:bg-white/10 px-5 py-2 rounded-full font-bold text-xs transition active:scale-95">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Common Questions */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold font-headline-lg text-gray-900">
          {activeCategory ? `${activeCategory} Articles` : 'Common Questions'}
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)} className="ml-3 text-xs text-orange-500 font-bold hover:underline">
              Clear filter
            </button>
          )}
        </h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading articles…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Could not load help articles. Please try again.</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500">No articles found. Try a different search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((faq) => (
              <div key={faq.id} className="bg-white p-6 rounded-3xl border border-gray-150 flex flex-col justify-between hover:shadow-sm transition-all shadow-sm">
                <div className="space-y-3">
                  <span className="inline-block bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {faq.category}
                  </span>
                  <h4 className="font-bold text-sm text-gray-800 leading-snug">{faq.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{faq.short_description || faq.content}</p>
                </div>
                <div className="pt-6">
                  <span className="text-orange-500 font-bold text-xs flex items-center gap-1 cursor-pointer group hover:underline">
                    Read guide <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
