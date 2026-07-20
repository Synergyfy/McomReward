"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Building2, User } from "lucide-react";
import Link from "next/link";

interface SignupClientProps {
  provisionCode?: string;
}

function SignupCard() {
  const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "https://mcomsolutions.vercel.app";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const handleCustomerSignup = () => {
    window.location.href = `${solutionsUrl}/register/customer?source=mcomloyalty&redirect=${encodeURIComponent(`${appUrl}/auth/sso`)}`;
  };

  const handleBusinessSignup = () => {
    window.location.href = `${solutionsUrl}/getstarted/business?source=mcomloyalty&redirect=${encodeURIComponent(`${appUrl}/auth/sso`)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full lg:w-[480px] bg-white border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden text-slate-800"
    >
      <div className="text-center py-6 border-b border-slate-100 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Choose how you want to join MCOM Rewards</p>
      </div>

      <div className="relative p-6 md:p-8 min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center w-full flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Get Started</h2>
          <p className="text-slate-500 text-sm mb-8">
            Select your role below to begin your journey
          </p>

          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={handleCustomerSignup}
              className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition shadow-sm"
            >
              <User size={20} />
              Sign up as Customer
            </button>

            <button
              onClick={handleBusinessSignup}
              className="flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-800 font-medium py-3 rounded-xl transition shadow-sm"
            >
              <Building2 size={20} />
              Sign up as Business
            </button>
          </div>
        </div>
      </div>

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
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-12 space-y-6">
        <h1 className="text-4xl font-extrabold text-orange-500">MCOM Rewards</h1>
        <p className="text-slate-600 text-lg leading-relaxed max-w-md">
          Earn rewards, grow loyalty, and connect smarter.
          Join as a <span className="text-orange-500 font-semibold">Customer</span> or{" "}
          <span className="text-orange-500 font-semibold">Business</span> — the choice is yours
        </p>
        <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
      </div>

      <Suspense fallback={<div className="w-full lg:w-[480px] h-[600px] bg-slate-100 rounded-3xl animate-pulse" />}>
        <SignupCard />
      </Suspense>
    </div>
  );
}
