"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, User, ArrowLeft } from "lucide-react";
import CustomerSignupPage from "@/components/Forms/CustomerSignupForm";
import BusinessSignupForm from "@/components/Forms/BusinessSignupForm";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface SignupClientProps {
  provisionCode?: string;
}

function SignupCard({ provisionCode }: { provisionCode?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTypeParam = searchParams.get("type");
  const refCode = searchParams.get("ref");

  const initialType = (initialTypeParam === "customer" || initialTypeParam === "business")
    ? initialTypeParam
    : (refCode ? "business" : null);

  const [selectedType, setSelectedType] = useState<"customer" | "business" | null>(initialType);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      layout
      className="relative w-full lg:w-[480px] bg-white border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden text-slate-800"
    >
      {/* Header */}
      <div className="text-center py-6 border-b border-slate-100 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Choose how you want to join Loyalty CardX</p>
      </div>

      {/* FORM AREA */}
      <motion.div
        layout
        className="relative p-6 md:p-8 min-h-[540px] flex flex-col items-center justify-start"
      >
        <AnimatePresence mode="wait">
          {/* Step 1 — Choose Type */}
          {!selectedType && (
            <motion.div
              key="choose"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              transition={{ duration: 0.4 }}
              className="text-center w-full flex flex-col items-center justify-center flex-1"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Get Started</h2>
              <p className="text-slate-500 text-sm mb-8">
                Select your role below to begin your journey
              </p>

              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => router.push("/customer")}
                  className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition shadow-sm"
                >
                  <User size={20} />
                  Sign up as Customer
                </button>

                <button
                  onClick={() => {
                    const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "https://mcomsolutions.vercel.app";
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
                    window.location.href = `${solutionsUrl}/getstarted/business?source=mcomloyalty&redirect=${encodeURIComponent(`${appUrl}/sso-login`)}`;
                  }}
                  className="flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-800 font-medium py-3 rounded-xl transition shadow-sm"
                >
                  <Building2 size={20} />
                  Sign up as Business
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Customer Form */}
          {selectedType === "customer" && (
            <motion.div
              key="customer"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              transition={{ duration: 0.5 }}
              layout
              className="w-full flex flex-col flex-1"
            >
              <button
                onClick={() => setSelectedType(null)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500 mb-4"
              >
                <ArrowLeft size={18} /> Back
              </button>

              {/* Scrollable Form */}
              <div className="overflow-y-auto max-h-[500px] pr-2 custom-scroll">
                <CustomerSignupPage />
              </div>
            </motion.div>
          )}

          {/* Step 3 — Business Form */}
          {selectedType === "business" && (
            <motion.div
              key="business"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              transition={{ duration: 0.5 }}
              layout
              className="w-full flex flex-col flex-1"
            >
              <button
                onClick={() => setSelectedType(null)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500 mb-4"
              >
                <ArrowLeft size={18} /> Back
              </button>

              {/* Scrollable Form */}
              <div className="overflow-y-auto max-h-[500px] pr-2 custom-scroll">
                <BusinessSignupForm provisionCode={provisionCode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-white text-center py-5 space-y-2">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-500 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-orange-500 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-orange-500 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
}

export default function SignupClient({ provisionCode }: SignupClientProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-slate-50 p-4 md:p-8 text-slate-800">
      {/* LEFT — Intro Section */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-12 space-y-6">
        <h1 className="text-4xl font-extrabold text-orange-500">Loyalty CardX</h1>
        <p className="text-slate-600 text-lg leading-relaxed max-w-md">
          Earn rewards, grow loyalty, and connect smarter.
          Join as a <span className="text-orange-500 font-semibold">Customer</span> or{" "}
          <span className="text-orange-500 font-semibold">Business</span> — the choice is yours 🚀
        </p>
        <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
      </div>

      {/* RIGHT — Auth Card */}
      <Suspense fallback={<div className="w-full lg:w-[480px] h-[600px] bg-slate-100 rounded-3xl animate-pulse" />}>
        <SignupCard provisionCode={provisionCode} />
      </Suspense>

      {/* 🌈 Custom Scrollbar Styling */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #f54900;
          border-radius: 8px;
          transition: background 0.3s ease;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #ff843a;
        }
      `}</style>
    </div>
  );
}
