"use client";

import Head from "next/head";
import { useState } from "react";
import { Star, Rocket, Building, Crown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectedPlan {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  details: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
 const pricingPlans = [
  {
    name: "Bronze",
    icon: <Building className="text-orange-500" size={28} />,
    monthly: 19,
    yearly: 190,
    description: "Perfect for small local businesses starting loyalty.",
    details: `
The Bronze plan is designed for small shops or solo owners beginning with customer rewards.

You get access to ready-made templates, 1,000 monthly points, and basic email support.
This tier is ideal for learning how customers interact with your loyalty system
before scaling.
    `,
    features: [
      "Up to 1,000 points/month",
      "Ready-made stamp & point templates",
      "Basic analytics dashboard",
      "Email support",
    ],
  },

  {
    name: "Silver",
    icon: <Star className="text-orange-500" size={28} />,
    monthly: 49,
    yearly: 490,
    popular: true,
    description: "Great for growing businesses needing customization.",
    details: `
The Silver plan gives you full customization for your loyalty program,
including branded cards, customer tracking, and SMS rewards.

If you want a more powerful, dynamic loyalty system without jumping to enterprise,
Silver is the perfect middle ground.
    `,
    features: [
      "Up to 5,000 points/month",
      "Custom branded loyalty cards",
      "Customer history & analytics",
      "SMS rewards (up to 500/month)",
      "Priority email support",
    ],
  },

  {
    name: "Gold",
    icon: <Crown className="text-orange-600" size={28} />,
    monthly: 99,
    yearly: 990,
    
    description: "Full control, automation, and advanced reward logic.",
    details: `
Gold is the most popular plan — built for scaling businesses with automation needs.

You unlock the full campaign builder, referrals, multi-step rewards, and full analytics.
Perfect if your business already has steady customer flow and wants to maximize retention.
    `,
    features: [
      "Up to 20,000 points/month",
      "Advanced campaign builder",
      "Referral & invite rewards",
      "Multi-step & ladder rewards",
      "Unlimited SMS & email notifications",
      "Advanced analytics dashboard",
      "Priority support",
    ],
  },

  {
    name: "Platinum",
    icon: <Rocket className="text-orange-500" size={28} />,
    monthly: 249,
    yearly: 2490,
    description: "For franchises, chains, and high-volume enterprises.",
    details: `
The Platinum plan unlocks everything — including enterprise-grade features.

This tier offers unlimited program capacity, white-labeling, API access,
multi-location management, and a dedicated account manager.

Perfect for large brands, agencies, or franchise groups.
    `,
    features: [
      "Unlimited points",
      "White-label platform (your brand, your domain)",
      "API access & integration support",
      "Multi-location and franchise management",
      "Custom reward logic",
      "Dedicated account manager",
      "Custom reporting & analytics",
      "24/7 priority support",
    ],
  },
];

  return (
    <>
      <Head>
        <title>Pricing — Loyalty CardX</title>
      </Head>

      <main className="min-h-screen bg-white text-gray-800">

        {/* HERO */}
        <section className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 py-20 text-center text-white">
          <div className="max-w-3xl mx-auto px-6">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-5xl font-extrabold mb-4">
              Flexible Pricing Plans
            </h1>
            <p className="text-orange-50 text-lg">
              Scale your business with the plan that fits your goals.
            </p>
          </div>
        </section>

        {/* BILLING TOGGLE */}
        <section className="py-8 text-center">
          <div className="inline-flex bg-gray-100 rounded-full px-2 py-2 gap-2">
            <span
              className={`px-4 py-2 rounded-full cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </span>

            <span
              className={`px-4 py-2 rounded-full cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly <span className="text-xs">(Save 20%)</span>
            </span>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">

            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                onClick={() => setSelectedPlan(plan)}
                className={`relative bg-white rounded-2xl p-8 text-center cursor-pointer
                hover:shadow-xl transition transform hover:-translate-y-1 border 
                ${
                  plan.popular
                    ? "border-2 border-orange-500 shadow-lg scale-105"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6 bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="bg-orange-50 w-14 h-14 flex items-center justify-center rounded-xl mx-auto mb-4">
                  {plan.icon}
                </div>

                <h2 className="text-2xl font-bold text-orange-600 mb-2">
                  {plan.name}
                </h2>

                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="text-5xl font-bold mb-4">
                  ${billingCycle === "monthly" ? plan.monthly : plan.yearly}
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* MODAL POPUP */}
        <AnimatePresence>
          {selectedPlan && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPlan(null)}
              />

              {/* Modal Box */}
              <motion.div
                className="fixed top-1/2 left-1/2 w-[90%] max-w-2xl bg-white rounded-3xl p-8 z-[70] 
                -translate-x-1/2 -translate-y-1/2 shadow-2xl overflow-y-auto max-h-[80vh]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-orange-600"
                  onClick={() => setSelectedPlan(null)}
                >
                  <X size={22} />
                </button>

                <h2 className="text-3xl font-bold text-orange-600 mb-3">
                  {selectedPlan.name} Plan
                </h2>

                <p className="text-gray-600 whitespace-pre-line mb-6">
                  {selectedPlan.details}
                </p>

                <h3 className="font-semibold text-gray-800 mb-2">
                  What’s included:
                </h3>

                <ul className="text-gray-700 space-y-2 mb-6">
                  {selectedPlan.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-orange-500 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className="block text-center bg-orange-500 hover:bg-orange-600 text-white 
                  font-semibold py-3 rounded-lg"
                >
                  Start {selectedPlan.name}
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </main>
    </>
  );
}
