"use client";

import Head from "next/head";
import Image from "next/image";
import {
  Rocket,
  Gift,
  BarChart3,
  Users,
  Shield,
  HelpCircle,
  Download,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: Rocket,
    title: "Campaign Builder",
    description:
      "Create campaigns in minutes using pre-built templates. Customize points, rewards, and dates, then publish instantly. QR codes and posters are generated automatically.",
    details:
      "The Campaign Builder lets you choose campaign types, define earning rules (e.g., spend-based, visit-based, or referral-based), set reward tiers, and preview your campaign in real-time before publishing. You can even duplicate past campaigns for faster setup.",
    image: "/assets/campaign-builder.jpg",
  },
  {
    icon: Gift,
    title: "Points & Rewards",
    description:
      "Track customer points, issue vouchers, and view redemptions. Customers can easily redeem in-store or online, with real-time updates to your dashboard.",
    details:
      "Points and Rewards allow you to design flexible reward structures — assign points per purchase or custom actions. Integrates seamlessly with QR-based scans and voucher redemptions to ensure transparency and instant reward delivery.",
  },
  {
    icon: Download,
    title: "Marketing Assets",
    description:
      "Download QR codes, posters, and social media images. Order professional prints with one click, ready to display in-store or share online.",
    details: `
Automatically generate beautiful QR posters, digital flyers, and shareable social media cards for each campaign. 
Boost your brand visibility and reduce setup time with instant design-ready materials.

Every campaign comes with high-resolution posters, table cards, social-media banners, and WhatsApp flyers — all automatically branded.

Assets update when your campaign changes, ensuring your materials always stay in sync.

Supports multi-branch auto-branding, custom uploads, print-ready templates, and instant social-share links.
    `,
    image: "/assets/marketing.jpg",
   
  },
  {
    icon: Users,
    title: "Invite & Affiliate System",
    description:
      "Invite nearby businesses or customers using a unique link or QR. Earn bonus points and ladder rewards for every successful referral.",
    details:
      "Use the built-in affiliate engine to grow your local business network. Track referrals, manage tiers of affiliate rewards, and integrate with your existing CRM for seamless partnership growth.",
  
    video: "A6XUVjK9W4o",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Monitor campaign performance, points issued vs redeemed, and ROI. Export CSV reports and visualize redemption trends over the last 30 days.",
    details:
      "Comprehensive reporting dashboard featuring trend graphs, heatmaps of customer activity, and ROI breakdowns.",
  },
  {
    icon: Wallet,
    title: "Customer Wallet",
    description:
      "Customers can track points, redeem vouchers, and view transaction history.",
    details:
      "Customers access a simple digital wallet showing real-time points, available vouchers, and redemption logs.",
    image: "/assets/marketing-banner.jpg",
  },
  {
    icon: Shield,
    title: "Secure & Role-Based",
    description:
      "Businesses see only their own data, customers see their points and vouchers, and admins have limited access for support.",
    details:
      "Enterprise-grade security architecture with role-based access control, encrypted tokens, and activity auditing.",
    image: "/assets/marketing-banner.jpg",
   
  },
  {
    icon: HelpCircle,
    title: "Training & Help",
    description:
      "Step-by-step tutorials and videos help you and your team get started quickly.",
    details:
      "Integrated guides, videos, and onboarding wizards tailored by user role for faster learning.",
    video: "dQw4w9WgXcQ",
  },
];
interface SelectedFeature {
  title: string;
  description: string;
  details: string;
  image?: string;
  video?: string;
}

export default function Features() {
  const [selected, setSelected] = useState<SelectedFeature | null>(null);

  return (
    <>
      <Head>
        <title>Features — Mcom Reward</title>
      </Head>

      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 py-24 text-center text-white">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <Rocket className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-5xl font-extrabold mb-4">Powerful Features</h1>
            <p className="text-orange-50 text-lg max-w-2xl mx-auto">
              Discover everything Loyalty CardX offers to help your business
              grow, reward customers, and track performance.
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, details, image, video }, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className="border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition bg-white hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelected({ title, description, details, image, video })}
            >
              <div className="bg-orange-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Icon className="text-orange-500" size={26} />
              </div>
              <h2 className="text-xl font-semibold text-orange-600 mb-2">{title}</h2>
              <p className="text-gray-700">{description}</p>
            </motion.div>
          ))}
        </section>

        {/* Modal */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
              />

              {/* Modal Box */}
              <motion.div
                className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-3xl bg-white rounded-3xl shadow-2xl p-8 -translate-x-1/2 -translate-y-1/2 overflow-y-auto max-h-[80vh] custom-scrollbar"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.4 }}
              >
                {/* Close */}
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-orange-600"
                  onClick={() => setSelected(null)}
                >
                  <X size={22} />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-orange-600 mb-4">
                  {selected.title}
                </h2>

                {/* Image */}
                {selected.image && (
                  <div className="relative w-full h-60 mb-6 rounded-xl overflow-hidden shadow">
                    <Image
                      src={selected.image}
                      alt={selected.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* YouTube Video */}
                {selected.video && (
                  <div className="mb-6 rounded-xl overflow-hidden shadow-md aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${selected.video}`}
                      title="YouTube Video Player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-700 mb-6">{selected.description}</p>

                {/* Details */}
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {selected.details}
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* CTA */}
        <section className="py-20 bg-orange-50 text-center">
          <h2 className="text-3xl font-bold text-orange-500 mb-4">
            Ready to Launch Your First Campaign?
          </h2>
          <p className="text-gray-700 mb-8">
            Build campaigns, issue rewards, and watch your engagement grow.
          </p>
          <a
            href="/dashboard"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Go to Dashboard
          </a>
        </section>
      </main>
    </>
  );
}
