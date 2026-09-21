"use client";

import { useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSsoExchange, useSsoLogin } from "@/services/auth/hook";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

const processedCodes = new Set<string>();

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: ssoExchange } = useSsoExchange();
  const { mutateAsync: ssoLogin } = useSsoLogin();
  const attempted = useRef(false);
  const mountedRef = useRef(true);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const ssoToken = searchParams.get("sso_token") || searchParams.get("token");
  const roleParam = searchParams.get("role");
  const error = searchParams.get("error");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  useEffect(() => {
    if (attempted.current) return;

    if (error) {
      attempted.current = true;
      toast.error("SSO authentication failed. Please try again.");
      router.push("/login");
      return;
    }

    if (!code && !ssoToken) {
      attempted.current = true;
      router.push("/login");
      return;
    }

    if (code) {
      const storedState = Cookies.get("sso_state") || getCookie("sso_state");
      if (storedState && state && storedState !== state) {
        attempted.current = true;
        console.error("SSO CSRF state mismatch: stored =", storedState, "received =", state);
        toast.error("CSRF security verification failed. Please try again.");
        router.push("/login");
        return;
      }
      Cookies.remove("sso_state", { path: "/" });
    }

    attempted.current = true;

    const handleSuccess = async (data: any) => {
      if (!mountedRef.current) return;

      toast.success("Welcome back!");

      const userRole = data?.role || data?.user?.role || roleParam;

      if (userRole === "Business" || userRole === "business") {
        try {
          const { data: status } = await api.get("/setup/status");
          if (status?.hasReward || status?.hasCampaign) {
            router.push("/dashboard");
            return;
          }
          const stored = typeof window !== "undefined" ? localStorage.getItem("loyalty_setup_progress") : null;
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.hasCompletedSetup) {
              router.push("/dashboard");
              return;
            }
          }
          router.push("/loyalty-setup");
        } catch {
          router.push("/dashboard");
        }
      } else if (userRole === "Admin" || userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "Staff" || userRole === "staff") {
        router.push("/staff/dashboard");
      } else {
        router.push("/participant");
      }
    };

    const handleError = (err: any) => {
      if (!mountedRef.current) return;

      console.error("SSO Authentication Error:", err);
      if (Cookies.get("access")) {
        router.push("/loyalty-setup");
        return;
      }

      toast.error(err?.response?.data?.message || "Failed to complete SSO login. Please try again.");
      router.push("/login");
    };

    if (code) {
      if (processedCodes.has(code)) return;
      processedCodes.add(code);

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");
      const redirectUri =
        process.env.NEXT_PUBLIC_MCOM_REDIRECT_URI || `${appUrl}/auth/callback`;

      ssoExchange({ code, redirectUri })
        .then(handleSuccess)
        .catch(handleError);
    } else if (ssoToken) {
      if (processedCodes.has(ssoToken)) return;
      processedCodes.add(ssoToken);

      ssoLogin(ssoToken)
        .then(handleSuccess)
        .catch(handleError);
    }
  }, [code, state, ssoToken, roleParam, error, router, ssoExchange, ssoLogin, getCookie]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <h1 className="text-xl font-bold text-gray-900">Authenticating...</h1>
        <p className="text-gray-500">Please wait while we securely log you in.</p>
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

