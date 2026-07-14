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
import { Suspense } from "react";
import z from "zod";

type FormValues = z.infer<typeof businessSignUpSchema>;

function BusinessSignupContent() {
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
    }
  });

  React.useEffect(() => {
    if (refCode) {
      setValue('referralCode', refCode);
    }
  }, [refCode, setValue]);

  const { mutateAsync: signUp, } = useBusinessSignUp();
  const { mutateAsync: login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

const onSubmit = async (data: BusinessSignUpDto) => {
  try {
    const response = await signUp(data);
    console.log("Signup response:", response);

    await login({
      email: data.email,
      password: data.password,
    });
    toast.success('Business account created successfully!');

  } catch (error: any) {
    console.error('Signup or login error:', error);
    const rawMessage = error?.response?.data?.message;
    const errorMessage = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage || "Failed to create account. Please try again.";
    toast.error(errorMessage);
  }
};

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Create Your Business Account
        </h2>
        <p className="text-center text-gray-500 text-sm">
          Sign up to manage your vouchers, staff, and rewards
        </p>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
{...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
{...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
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

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
{...register("password")}
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
{...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
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

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/business/login"
            className="text-orange-500 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function BusinessSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BusinessSignupContent />
    </Suspense>
  );
}

