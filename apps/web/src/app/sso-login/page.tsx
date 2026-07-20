"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSsoLogin } from "@/services/auth/hook";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function SsoLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const { mutateAsync: ssoLogin } = useSsoLogin();
  const attempted = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (attempted.current) return;

    if (error) {
      attempted.current = true;
      toast.error("SSO authentication failed. Please try again.");
      router.push("/login");
      return;
    }

    if (!token) {
      attempted.current = true;
      router.push("/login");
      return;
    }

    attempted.current = true;

    ssoLogin(token)
      .then((data) => {
        if (!mountedRef.current) return;

        toast.success("Welcome back!");
        if (data.user.role === "Business" || data.user.role === "business") {
          router.push("/loyalty-setup");
        } else {
          router.push("/participant");
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return;

        console.error("SSO Login Error:", err);
        toast.error("SSO Login failed");
        router.push("/login");
      });
  }, [token, error, ssoLogin, router]);

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

export default function SsoLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    }>
      <SsoLoginContent />
    </Suspense>
  );
}
