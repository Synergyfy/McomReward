"use client";

import React, { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useAuth } from "@/services/business/hook";
import { useParticipantLogin } from "@/services/auth/hook";
import { useRouter, useSearchParams } from "next/navigation";
import { useJoinCampaign } from "@/services/customer-campaigns/hook";
import { useQueryClient } from "@tanstack/react-query";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const redirectUrl = searchParams.get("redirect");
  const queryClient = useQueryClient();

  const { mutateAsync: login } = useAuth();
  const { mutateAsync: participantLogin } = useParticipantLogin();
  const { mutateAsync: joinCampaign } = useJoinCampaign();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { rememberMe, ...loginData } = data;

      if (campaignId) {
        // Participant Login with Auto-Join
        await participantLogin({ ...loginData, campaignId })
          .then(async (response) => {
            // Store user name for CampaignMembershipContext
            if (response?.user?.name) {
              localStorage.setItem('campaignMemberName', response.user.name);
            }

            if (campaignId) {
              try {
                await joinCampaign(campaignId);
              } catch (joinError) {
                console.error("Failed to auto-join campaign:", joinError);
              }

              await queryClient.invalidateQueries({ queryKey: ['isJoined', campaignId] });
              await queryClient.invalidateQueries({ queryKey: ['publicCampaigns', campaignId] });
            }

            toast.success("Login successful! Joining campaign...");
            if (redirectUrl) {
              router.push(redirectUrl);
            } else {
              router.push(`/campaigns/${campaignId}`);
            }
          });
      } else {
        // General Login
        await login(loginData)
          .then((response) => {
            toast.success("Login successful! Redirecting...");
          });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
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
          <a href={campaignId ? `/signup?campaignId=${campaignId}&type=customer` : "/signup"} className="text-orange-400 hover:underline font-medium">
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
