"use client";

import { useState } from "react";
import { PlusCircle, MinusCircle, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "FAQ — Loyalty CardX",
  description:
    "Frequently Asked Questions about Loyalty CardX – learn how to start campaigns, earn points, and redeem rewards.",
};

const faqs = [
  {
    question: "How do I start a campaign?",
    answer:
      "Log in to your Business Dashboard, click 'Claim Template', choose an offer, edit points if needed, then click 'Publish Campaign'. Your QR and poster will be generated automatically.",
  },
  {
    question: "How do customers earn points?",
    answer:
      "Customers earn points by making purchases at participating businesses, scanning QR codes, referring friends, or joining campaigns.",
  },
  {
    question: "How can I redeem points?",
    answer:
      "Customers can redeem points via the 'Wallet' section. Tap 'Redeem Reward' to see available offers. In-store, show the voucher QR to staff; online, copy the code at checkout.",
  },
  {
    question: "How do I get my poster and QR code?",
    answer:
      "After publishing a campaign, go to the 'Assets' section. You can preview, download your poster or QR code, or order printed assets directly via VistaPrint.",
  },
  {
    question: "Can I invite other businesses?",
    answer:
      "Yes! Use the 'Invite' panel to share your unique referral link or QR via WhatsApp, SMS, Email, or print flyer. Earn bonus points when invitees join and launch their campaigns.",
  },
  {
    question: "How do points expire?",
    answer:
      "Points do not expire automatically, but inactive or expired campaigns may affect redeemable points. Always check your Wallet for the most up-to-date balance.",
  },
  {
    question: "Who can see my data?",
    answer:
      "Businesses see only their own campaigns, points, and redemptions. Customers see only their individual wallet data. Admins have access solely for system support.",
  },
  {
    question: "What if I need help?",
    answer:
      "Click 'Help' in the Dashboard or contact us anytime at support@mcomrewards.com. You can also explore tutorials and guides in the Help Center.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 py-24 text-center text-white">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-white opacity-90" />
            <h1 className="text-5xl font-extrabold mb-4">Frequently Asked Questions</h1>
            <p className="text-orange-50 text-lg max-w-2xl mx-auto">
              Everything you need to know about Loyalty CardX — from setting up campaigns to rewarding your customers.
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </section>

        {/* FAQ List */}
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-lg text-gray-800 focus:outline-none"
                >
                  <span className="text-orange-600">{faq.question}</span>
                  {isOpen ? (
                    <MinusCircle className="text-orange-500" size={22} />
                  ) : (
                    <PlusCircle className="text-orange-500" size={22} />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-4 text-gray-700">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-orange-50 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-700 mb-8">
              Our support team is here to help. Reach out anytime for guidance, technical support, or partnership opportunities.
            </p>
            <a
              href="/contact"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
