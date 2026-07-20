"use client";

import React, { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const [isLoading, setIsLoading] = useState(false);

  const handleSsoLogin = async () => {
    setIsLoading(true);
    try {
      const state = crypto.randomUUID();
      const isSecure = window.location.protocol === "https:";
      document.cookie = `sso_state=${state}; path=/; maxAge=600; SameSite=Lax${isSecure ? "; Secure" : ""}`;

      const centralApi = process.env.NEXT_PUBLIC_MCOM_CENTRAL_API || "http://localhost:3010/api/v1";
      const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "mcom-loyalty";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
      const redirectUri = `${appUrl}/auth/callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        state,
        scope: "profile email",
      });

      window.location.href = `${centralApi}/auth/sso/authorize?${params.toString()}`;
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
          className="w-full flex items-center justify-center gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
            </svg>
          )}
          {isLoading ? "Redirecting..." : "Login with MCOM Solutions"}
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
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
