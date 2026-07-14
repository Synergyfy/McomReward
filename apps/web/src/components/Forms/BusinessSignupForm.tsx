"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { useBusinessSignUp, useAuth } from "@/services/business/hook";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { BusinessSignUpDto } from "@/services/business/types";
import { businessSignUpSchema } from "@/lib/validators/signupSchemas";
import Link from "next/link";
import z from "zod";

type FormValues = z.infer<typeof businessSignUpSchema>;

interface BusinessSignupFormProps {
  provisionCode?: string;
}

export default function BusinessSignupForm({ provisionCode }: BusinessSignupFormProps) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(businessSignUpSchema),
    defaultValues: {
      referralCode: refCode || '',
      provisionCode: provisionCode || '',
    }
  });

  React.useEffect(() => {
    if (refCode) {
      setValue('referralCode', refCode);
    }
    if (provisionCode) {
      setValue('provisionCode', provisionCode);
    }
  }, [refCode, provisionCode, setValue]);

  const { mutateAsync: signUp } = useBusinessSignUp();
  const { mutateAsync: login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: BusinessSignUpDto) => {
    try {
      const response = await signUp(data);
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
  };  return (
    <div className="h-full flex items-center justify-center bg-transparent text-slate-800">
      <div className="bg-transparent w-full max-w-md p-2 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-slate-900">
          Manage your vouchers, staff, and rewards
        </h2>
        <p className="text-center text-slate-500 text-sm"></p>

        {/* Sign up with Google */}
        <Button
          type="button"
          onClick={handleGoogleSignup}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
        >
          <FcGoogle className="w-5 h-5" />
          Sign up with Google
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200/60" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-200/60" />
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-slate-700">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-slate-700">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-slate-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm text-slate-500 hover:text-orange-500"
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
            <Label htmlFor="confirmPassword" className="text-slate-700">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="referralCode" className="text-slate-700">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
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
            className="w-full bg-orange-500 hover:bg-orange-650 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}