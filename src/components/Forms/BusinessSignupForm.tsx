"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { useBusinessSignUp, useAuth } from "@/services/business/hook";
import { toast } from "sonner"; // or your toast lib (shadcn, react-hot-toast, etc.
import { useRouter } from "next/navigation";
import { BusinessSignUpDto } from "@/services/business/types";
import Link from "next/link";

export default function BusinessSignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BusinessSignUpDto>();
  const router = useRouter();

  const { mutateAsync: signUp } = useBusinessSignUp();
  const { mutateAsync: login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: BusinessSignUpDto) => {
    try {
      // Destructure to guarantee no 'name' property is sent (since backend CreateBusinessDto forbids it)
      const { name, ...cleanData } = data as any;
      // 1️⃣ Call the signup mutation
      const response = await signUp(cleanData);
      console.log("Signup response:", response);

      // 2️⃣ Automatically sign in after signup
      await login({
        email: data.email,
        password: data.password,
      });

      toast.success("Business account created successfully!");
      // Redirection handled by useAuth
    } catch (error: any) {
      console.error("Signup or login error:", error);
      const rawMessage = error?.response?.data?.message;
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage || "Failed to create account. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
    // TODO: integrate with NextAuth or Firebase Google sign-in
  };

  return (
    <div className="h-full flex items-center justify-center bg-white ">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl  space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Manage your vouchers, staff, and rewards
        </h2>
        <p className="text-center text-gray-500 text-sm"></p>

        {/* Sign up with Google */}
        <Button
          type="button"
          onClick={handleGoogleSignup}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <FcGoogle className="w-5 h-5" />
          Sign up with Google
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                {...register("firstName", { required: "First Name is required" })}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                {...register("lastName", { required: "Last Name is required" })}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
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

          <div>
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code"
              {...register("referralCode")}
            />
            {errors.referralCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.referralCode.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
