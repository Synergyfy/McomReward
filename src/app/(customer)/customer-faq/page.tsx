"use client";

import { HelpCircle, ChevronDown } from "lucide-react";

const faqData = [
  {
    category: "General",
    questions: [
      {
        q: "What is Loyalty CardX?",
        a: "Loyalty CardX helps you earn points and rewards from your favorite businesses and redeem them easily from your dashboard.",
      },
      {
        q: "Is Loyalty CardX free to use?",
        a: "Yes! Creating an account and joining campaigns is completely free.",
      },
    ],
  },
  {
    category: "Points & Rewards",
    questions: [
      {
        q: "How do I earn points?",
        a: "You earn points by participating in campaigns, referring friends, or making purchases from partner businesses.",
      },
      {
        q: "How do I redeem rewards?",
        a: "Head to the ‘Reward Redemption’ tab, choose your desired reward, and confirm the redemption.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "Can I update my profile details?",
        a: "Yes, you can edit your name, email, and password in your account settings.",
      },
      {
        q: "What should I do if I forget my password?",
        a: "Click on ‘Forgot Password’ at login to receive a reset link via email.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:pt-28">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-10">
        Find quick answers to some of the most common questions below.
      </p>

      <div className="space-y-8">
        {faqData.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <HelpCircle className="text-orange-500" /> {section.category}
            </h2>
            <div className="space-y-4">
              {section.questions.map((item, idx) => (
                <details
                  key={idx}
                  className="group border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                >
                  <summary className="font-medium text-gray-800 cursor-pointer flex justify-between items-center">
                    {item.q}
                    <ChevronDown className="text-orange-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
