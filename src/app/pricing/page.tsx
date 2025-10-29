"use client";
import Head from "next/head";
import { useState } from "react";
import { Star, Rocket, Building, Crown } from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  // pricing data
  const pricingPlans = [
    {
      name: "Basic",
      icon: <Building className="text-orange-500" size={28} />,
      monthly: 29,
      yearly: 290, // ~2 months free
      description: "Perfect for small businesses starting out.",
      features: [
        "Up to 1,000 points/month",
        "Claim ready-made templates",
        "Email support",
      ],
    },
    {
      name: "Pro",
      icon: <Rocket className="text-orange-600" size={28} />,
      monthly: 79,
      yearly: 790,
      description: "For growing businesses that want full control.",
      features: [
        "Up to 10,000 points/month",
        "Full campaign builder",
        "Invite system & ladder rewards",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Partner",
      icon: <Crown className="text-orange-500" size={28} />,
      monthly: 199,
      yearly: 1990,
      description: "For agencies and high-volume businesses.",
      features: [
        "Unlimited points",
        "White-label campaigns",
        "Dedicated account manager",
        "Custom analytics",
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing — Loyalty CardX</title>
        <meta
          name="description"
          content="Choose the best plan for your business. Simple, transparent pricing to grow with Loyalty CardX."
        />
      </Head>

      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 py-20 text-center text-white">
          <div className="max-w-3xl mx-auto px-6">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-5xl font-extrabold mb-4">Flexible Pricing Plans</h1>
            <p className="text-orange-50 text-lg max-w-2xl mx-auto">
              Scale your business with the plan that fits your goals. Save 20% on yearly billing.
            </p>
          </div>
        </section>

        {/* Billing Toggle */}
        <section className="py-8 bg-white text-center">
          <div className="inline-flex items-center justify-center bg-gray-100 rounded-full px-2 py-2 gap-2">
            <span
              className={`px-4 py-2 rounded-full font-medium cursor-pointer transition ${
                billingCycle === "monthly"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </span>
            <span
              className={`px-4 py-2 rounded-full font-medium cursor-pointer transition ${
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

        {/* Pricing Cards */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1 border ${
                  plan.popular ? "border-2 border-orange-500 scale-105 shadow-lg" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="bg-orange-50 w-14 h-14 flex items-center justify-center rounded-xl mx-auto mb-4">
                  {plan.icon}
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    plan.popular ? "text-orange-600" : "text-orange-500"
                  }`}
                >
                  {plan.name}
                </h2>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="text-5xl font-bold text-gray-900 mb-6">
                  ${billingCycle === "monthly" ? plan.monthly : plan.yearly}
                  <span className="text-lg font-normal">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                <ul className="text-gray-700 space-y-2 mb-6 text-left max-w-xs mx-auto">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Start {plan.name}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Value Add Section */}
        <section className="py-16 bg-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">
              Every Plan Includes
            </h2>
            <p className="text-gray-700 mb-8">
              Real-time analytics, secure dashboards, QR generation, customer wallet, and onboarding support.
            </p>
            <p className="text-gray-600 italic">
              No setup fees. Cancel anytime.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-orange-50 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-700 mb-8">
              Choose your plan and launch your first campaign in just minutes.
            </p>
            <a
              href="/signup"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Get Started
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-8 border-t border-gray-200 text-center text-gray-500">
          © {new Date().getFullYear()} Loyalty CardX. All rights reserved.
        </footer>
      </main>
    </>
  );
}
