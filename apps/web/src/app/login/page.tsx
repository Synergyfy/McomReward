"use client";

import React, { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import Cookies from "js-cookie";

function LoginForm() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const [isLoading, setIsLoading] = useState(false);

  const handleSsoLogin = () => {
    setIsLoading(true);
    try {
      // 1. Generate random 32-byte CSRF state token
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const state = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
      const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
      Cookies.set("sso_state", state, { path: "/", sameSite: "lax", expires: 1 / 144, secure: isSecure });

      // 2. Construct OAuth 2.0 Authorization redirect URL
      const mcomSolutionsUrl = (
        process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "http://localhost:3010"
      ).replace(/\/$/, "");
      const clientId = process.env.NEXT_PUBLIC_MCOM_CLIENT_ID || "mcom-rewards";
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");
      const redirectUri =
        process.env.NEXT_PUBLIC_MCOM_REDIRECT_URI || `${appUrl}/auth/callback`;
      const scopes =
        process.env.NEXT_PUBLIC_MCOM_SCOPES || "profile email business packages membership";

      const authorizeUrl = `${mcomSolutionsUrl}/api/v1/auth/sso/authorize?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
        scopes
      )}&state=${encodeURIComponent(state)}`;

      // 3. Redirect user browser to MCOM Solutions SSO
      window.location.href = authorizeUrl;
    } catch (error) {
      toast.error("Failed to initiate SSO login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200/60 rounded-2xl shadow-2xl p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-slate-900">
          Welcome Back
        </h2>
        <p className="text-center text-slate-500 text-sm">
          Log in to manage your account
        </p>

        <Button
          type="button"
          onClick={handleSsoLogin}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3 rounded-xl shadow-xs cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
            </svg>
          )}
          {isLoading ? "Redirecting to MCOM..." : "Login with MCOM"}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <a href={campaignId ? `/signup?campaignId=${campaignId}&type=customer` : "/signup"} className="text-orange-500 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
