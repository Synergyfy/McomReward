"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, User, ArrowLeft } from "lucide-react";
import CustomerSignupPage from "@/components/Forms/CustomerSignupForm";
import BusinessSignupForm from "@/components/Forms/BusinessSignupForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignupContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  // Initialize state based on query param if valid
  const [selectedType, setSelectedType] = useState<"customer" | "business" | null>(
    typeParam === "customer" ? "customer" : typeParam === "business" ? "business" : null
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      layout
      className="relative w-full lg:w-[480px] bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden"
    >
      {/* Header */}
      <div className="text-center py-6 border-b border-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Choose how you want to join Loyalty CardX</p>
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
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Get Started</h2>
              <p className="text-gray-500 text-sm mb-8">
                Select your role below to begin your journey
              </p>

              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => setSelectedType("customer")}
                  className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition shadow-sm"
                >
                  <User size={20} />
                  Sign up as Customer
                </button>

                <button
                  onClick={() => setSelectedType("business")}
                  className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition shadow-sm"
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
              {/* Show back button only if type was not pre-selected via URL */}
              {!typeParam && (
                <button
                  onClick={() => setSelectedType(null)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-4"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}

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
              {!typeParam && (
                <button
                  onClick={() => setSelectedType(null)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-4"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}

              {/* Scrollable Form */}
              <div className="overflow-y-auto max-h-[500px] pr-2 custom-scroll">
                <BusinessSignupForm />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-white text-center py-5 space-y-2">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-500 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
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

export default function SignupLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white p-4 md:p-8">
      {/* LEFT — Intro Section */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-12 space-y-6">
        <h1 className="text-4xl font-extrabold text-orange-600">Loyalty CardX</h1>
        <p className="text-gray-600 text-lg leading-relaxed max-w-md">
          Earn rewards, grow loyalty, and connect smarter.
          Join as a <span className="text-orange-500 font-semibold">Customer</span> or{" "}
          <span className="text-orange-500 font-semibold">Business</span> — the choice is yours 🚀
        </p>
        <div className="h-1 w-24 bg-orange-400 rounded-full"></div>
      </div>

      {/* RIGHT — Auth Card */}
      <Suspense fallback={<div>Loading...</div>}>
        <SignupContent />
      </Suspense>

      {/* 🌈 Custom Scrollbar Styling */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f9f9f9;
          border-radius: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 8px;
          transition: background 0.3s ease;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
      `}</style>
    </div>
  );
}
