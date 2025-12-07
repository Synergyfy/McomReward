"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner"; // or your toast lib (shadcn, react-hot-toast, etc.)
import { useAuth } from "@/services/business/hook";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function BusinessLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
  });

  const { mutateAsync: login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { rememberMe, ...loginData } = data;
      console.log("Logging in:", loginData);

      await login(loginData);

      toast.success("Login successful! Redirecting...");
      // Redirection is handled by the useAuth hook onSuccess callback
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Example: await signIn("google");
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
          Log in to manage your vouchers and rewards
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
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
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

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="rememberMe" />
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
