"use client";

import { useState } from "react";
import { Search, FileText, Star, Gift, Wallet, Settings } from "lucide-react";

const helpArticles = [
  {
    id: 1,
    title: "Getting Started with Loyalty CardX",
    description: "Learn how to sign up, earn points, and start redeeming rewards.",
    icon: <Star className="text-orange-500" />,
  },
  {
    id: 2,
    title: "How to Redeem Rewards",
    description: "Follow this guide to use your points for vouchers, discounts, or products.",
    icon: <Gift className="text-orange-500" />,
  },
  {
    id: 3,
    title: "Understanding Tier Levels",
    description: "See how your loyalty tier impacts your benefits and rewards.",
    icon: <FileText className="text-orange-500" />,
  },
  {
    id: 4,
    title: "Managing Your Wallet",
    description: "View your balance, recent transactions, and manage reward points.",
    icon: <Wallet className="text-orange-500" />,
  },
  {
    id: 5,
    title: "Account Settings & Security",
    description: "Update your account info and keep your profile secure.",
    icon: <Settings className="text-orange-500" />,
  },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:pt-28">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Help Center</h1>
      <p className="text-gray-600 mb-8">
        Browse through our resources and find quick answers to your questions.
      </p>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
        />
      </div>

      {/* Articles Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div
              key={article.id}
              className="p-5 border border-gray-100 bg-white rounded-xl shadow-sm hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3 mb-3">
                {article.icon}
                <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition">
                  {article.title}
                </h3>
              </div>
              <p className="text-sm text-gray-500">{article.description}</p>
              <a
                href={`/help-center/${article.id}`}
                className="text-orange-600 text-sm font-medium mt-3 inline-block hover:underline"
              >
                Read More →
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No articles found for “{search}”.
          </p>
        )}
      </div>
    </div>
  );
}

