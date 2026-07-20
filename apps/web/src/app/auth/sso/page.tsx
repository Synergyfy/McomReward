"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSsoLogin } from "@/services/auth/hook";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function SSOReceiverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: ssoLogin } = useSsoLogin();
  const attempted = useRef(false);
  const mountedRef = useRef(true);

  const ssoToken = searchParams.get("sso_token");
  const role = searchParams.get("role");
  const error = searchParams.get("error");

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

    if (!ssoToken) {
      attempted.current = true;
      router.push("/login");
      return;
    }

    attempted.current = true;

    ssoLogin(ssoToken)
      .then((data) => {
        if (!mountedRef.current) return;

        toast.success("Welcome back!");

        const userRole = data?.user?.role || role;

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

        console.error("SSO Login Error:", err);
        toast.error("Failed to complete SSO login. Please try again.");
        router.push("/login");
      });
  }, [ssoToken, error, role, router, ssoLogin]);

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
      <SSOReceiverContent />
    </Suspense>
  );
}
