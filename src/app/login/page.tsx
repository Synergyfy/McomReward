"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useAuth } from "@/services/business/hook";
import { useParticipantLogin } from "@/services/participant/hook";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Building2 } from "lucide-react";
import Cookies from "js-cookie";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  // Default to 'customer' unless explicitly toggled
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: businessLogin } = useAuth();
  const { mutateAsync: participantLogin } = useParticipantLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { rememberMe, ...loginData } = data;

      if (userType === 'business') {
        await businessLogin(loginData);
        toast.success("Business login successful! Redirecting...");
        // Redirect handled in hook usually, but business hook does it.
      } else {
        await participantLogin(loginData);
        toast.success("Login successful! Redirecting...");
        if (returnUrl) {
          router.push(returnUrl);
        } else {
           // Check both sessionStorage (immediate) and cookies (fallback)
          const storedCampaignId = sessionStorage.getItem('campaignId') || Cookies.get('campaignId');

          if (storedCampaignId) {
             // Clean up to avoid stale redirects later
            sessionStorage.removeItem('campaignId');
            Cookies.remove('campaignId');
            router.push(`/campaigns/${storedCampaignId}`);
          } else {
            router.push("/dashboard"); // Or participant dashboard
          }
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      toast.info("Redirecting to Google...");
    } catch {
      toast.error("Failed to sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 text-sm">
          Log in to manage your account
        </p>

        {/* User Type Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setUserType('customer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              userType === 'customer'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={18} />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setUserType('business')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              userType === 'business'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 size={18} />
            Business
          </button>
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="rememberMe" {...register("rememberMe")} />
              <Label htmlFor="rememberMe">Remember me</Label>
            </div>
            <a
              href="/forgot-password"
              className="text-gray-500 hover:underline text-sm"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-orange-400 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
