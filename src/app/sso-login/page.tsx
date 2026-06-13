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
  const { mutateAsync: ssoLogin } = useSsoLogin();
  const attempted = useRef(false);

  useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      ssoLogin(token)
        .then((data) => {
          toast.success("Welcome back!");
          // Redirect based on role
          if (data.user.role === "Business") {
            router.push("/dashboard");
          } else {
            router.push("/dashboard"); // Or wherever participants go
          }
        })
        .catch((error) => {
          console.error("SSO Login Error:", error);
          toast.error("SSO Login failed");
          router.push("/login");
        });
    } else if (!token && !attempted.current) {
      router.push("/login");
    }
  }, [token, ssoLogin, router]);

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
