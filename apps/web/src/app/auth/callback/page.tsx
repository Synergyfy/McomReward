"use client";

import { useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSsoExchange } from "@/services/auth/hook";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: ssoExchange } = useSsoExchange();
  const attempted = useRef(false);
  const mountedRef = useRef(true);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getCookie = useCallback((name: string): string | null => {
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

    if (!code || !state) {
      attempted.current = true;
      router.push("/login");
      return;
    }

    const storedState = getCookie("sso_state");
    document.cookie = "sso_state=; path=/; maxAge=0";

    if (!storedState || storedState !== state) {
      attempted.current = true;
      toast.error("Invalid SSO state. Please try again.");
      router.push("/login");
      return;
    }

    attempted.current = true;

    ssoExchange(code)
      .then((data) => {
        if (!mountedRef.current) return;

        toast.success("Welcome back!");

        const userRole = data?.role;

        if (userRole === "Business" || userRole === "business") {
          router.push("/loyalty-setup");
        } else if (userRole === "Admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "Staff") {
          router.push("/staff/dashboard");
        } else {
          router.push("/participant");
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return;

        console.error("SSO Exchange Error:", err);
        toast.error("Failed to complete SSO login. Please try again.");
        router.push("/login");
      });
  }, [code, state, error, router, ssoExchange, getCookie]);

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
