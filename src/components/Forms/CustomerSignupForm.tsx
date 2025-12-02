"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp, useJoinCampaign } from "@/services/customer-campaigns/hook";
import { useParticipantLogin } from "@/services/auth/hook";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";

type SignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function CustomerSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const queryClient = useQueryClient();

  const { mutateAsync: signUp, isPending: isSigningUp } = useSignUp();
  const { mutateAsync: participantLogin } = useParticipantLogin();
  const { mutateAsync: joinCampaign } = useJoinCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>();

  const onSubmit = async (data: SignupData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      // 1. Sign Up
      await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        campaignId: campaignId || '',
      });

      toast.success("Account created successfully! Logging in...");

      // 2. Auto Login & Join
      if (campaignId) {
        const response = await participantLogin({
          email: data.email,
          password: data.password,
          campaignId
        });

        if (response?.user?.name) {
          localStorage.setItem('campaignMemberName', response.user.name);
        }

        // Explicitly join the campaign after login to ensure status is updated
        try {
          await joinCampaign(campaignId);
        } catch (joinError) {
          console.error("Failed to auto-join campaign:", joinError);
          // Don't block flow if join fails (maybe already joined), but log it
        }

        // Invalidate queries to ensure the campaign page shows the updated member status immediately
        await queryClient.invalidateQueries({ queryKey: ['isJoined', campaignId] });
        await queryClient.invalidateQueries({ queryKey: ['publicCampaigns', campaignId] });

        toast.success("Joined campaign successfully!");
        router.push(`/campaigns/${campaignId}`);
      } else {
        toast.success("Please log in.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Signup failed. Please try again.";
      if (isAxiosError(error)) {
        errorMessage = (error.response?.data as {message: string})?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignup = () => {
    toast.info("Redirecting to Google Sign-In...");
    // TODO: integrate Google OAuth flow here
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Join <span className="text-orange-500">MCOM Rewards</span>
        </h2>
        <p className="text-center text-gray-500 text-sm">
          Sign up to start earning rewards and discovering local deals
        </p>

        {/* Google Sign-In */}
        <Button
          type="button"
          onClick={handleGoogleSignup}
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

        {/* SIGNUP FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              placeholder="John Doe"
              {...register("name", { required: "Full name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", { required: "Confirm Password is required" })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting || isSigningUp}
          >
            {isSubmitting || isSigningUp ? "Processing..." : "Join MCOM Rewards"}
          </Button>
        </form>
      </div>
    </div>
  );
}
