"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Turnstile from "@/components/ui/turnstile";
import { useAdminSignIn } from "@/services/auth/hook";
import { getCentralLoginUrl } from "@/lib/sso-utils";

function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSsoLoading, setIsSsoLoading] = useState(false);

  const { mutateAsync: adminSignIn, isPending } = useAdminSignIn();

  // If already logged in as Admin, redirect straight to dashboard
  useEffect(() => {
    const token = Cookies.get("access");
    if (token) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.role === "Admin" || parsed?.role === "admin") {
            router.replace("/admin/dashboard");
          }
        }
      } catch {
        // Continue to login if user data cannot be parsed
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please provide both email and password.");
      return;
    }

    try {
      const response = await adminSignIn({
        email: email.trim(),
        password,
        turnstileToken: turnstileToken || undefined,
      });

      const userRole = response?.user?.role;
      if (userRole && userRole !== "Admin" && userRole !== "admin") {
        // Clear tokens immediately if user is not an administrator
        Cookies.remove("access", { path: "/" });
        Cookies.remove("refresh", { path: "/" });
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setErrorMessage(
          "Access denied. This account does not hold administrator privileges."
        );
        toast.error("Unauthorized: Administrator role required.");
        return;
      }

      toast.success("Administrator authentication successful.");
      router.push("/admin/dashboard");
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Authentication failed. Please verify your administrator credentials.";
      setErrorMessage(
        Array.isArray(serverMsg) ? serverMsg.join(", ") : serverMsg
      );
      toast.error(
        Array.isArray(serverMsg) ? serverMsg[0] : serverMsg
      );
    }
  };

  const handleSsoAdminLogin = () => {
    setIsSsoLoading(true);
    try {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const state = Array.from(array, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const isSecure =
        typeof window !== "undefined" && window.location.protocol === "https:";
      Cookies.set("sso_state", state, {
        path: "/",
        sameSite: "lax",
        expires: 1 / 144,
        secure: isSecure,
      });

      const authorizeUrl = getCentralLoginUrl("/auth/callback", state);
      window.location.href = authorizeUrl;
    } catch {
      toast.error("Failed to initiate SSO authorization.");
      setIsSsoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 mb-4 border border-blue-400/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Restricted Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            MCOM Rewards Admin
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Authorized administrator credentials required
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-slate-200 text-xs font-medium">
                Administrator Email
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@mcom.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending || isSsoLoading}
                  required
                  autoComplete="email"
                  className="pl-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-slate-200 text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending || isSsoLoading}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Turnstile Bot Verification */}
            <div className="pt-1">
              <Turnstile onVerify={(token) => setTurnstileToken(token)} />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || isSsoLoading}
              className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 border-0 transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authenticate as Admin"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">
                Or authenticate via
              </span>
            </div>
          </div>

          {/* Central SSO Option */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSsoAdminLogin}
            disabled={isPending || isSsoLoading}
            className="w-full h-11 border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSsoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 text-blue-400" />
            )}
            {isSsoLoading ? "Connecting to SSO..." : "MCOM Central SSO"}
          </Button>

          {/* Back link */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Merchant / Customer Login
            </Link>
          </div>
        </div>

        {/* Security footnote */}
        <p className="text-center text-xs text-slate-600 mt-6 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-500" />
          End-to-end encrypted session • RBAC restricted
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
