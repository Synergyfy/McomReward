"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type LoginData = {
  email: string;
  password: string;
};

export default function CustomerLoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>();
  const router = useRouter();
  const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "https://mcomsolutions.vercel.app";
  const [appUrl, setAppUrl] = useState("http://localhost:3005");

  useEffect(() => {
    setAppUrl(window.location.origin);
  }, []);

  const onSubmit = async (data: LoginData) => {
    const redirectUrl = `${appUrl}/sso-login`;
    window.location.href = `${solutionsUrl}/login?source=mcomloyalty&redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${appUrl}/sso-login`;
    window.location.href = `${solutionsUrl}/login?source=mcomloyalty&redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Welcome Back to <span className="text-orange-500">MCOM Rewards</span>
        </h2>
        <p className="text-center text-gray-500 text-sm">
          Log in to manage your rewards and favorite campaigns
        </p>

        {/* Google Login */}
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
          <div className="h-px w-full bg-gray-200"></div>
          <span className="text-xs text-gray-400 uppercase tracking-widest bg-white px-2">OR</span>
          <div className="h-px w-full bg-gray-200"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-orange-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href={`${solutionsUrl}/register/customer?source=mcomloyalty&redirect=${encodeURIComponent(`${appUrl}/sso-login`)}`} className="text-orange-500 hover:underline font-medium">
            Join now
          </a>
        </p>
      </div>
    </div>
  );
}
