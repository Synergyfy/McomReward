"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";

interface CustomerSignUpForm {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function CampaignCustomerSignUp() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") || undefined;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerSignUpForm>();

  const [step, setStep] = useState<"email" | "full">("email");
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: CustomerSignUpForm) => {
    try {
      if (step === "email") {
        toast.info("No existing account found. Please complete your details.");
        setStep("full");
        return;
      }

      // Create the participant via the real signup endpoint
      const response = await api.post("/participant/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        campaignId,
      });

      if (response.data?.accessToken) {
        toast.success("Customer account created successfully!");
      } else {
        toast.success("Customer account created successfully!");
      }

      setIsSuccess(true);
      reset();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 409) {
        toast.success("Welcome back! You've been automatically enrolled 🎉");
        setIsSuccess(true);
        reset();
        return;
      }
      console.error("Customer creation failed:", error);
      toast.error(
        axiosError.response?.data?.message || "Failed to sign up customer."
      );
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen bg-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Join Our Campaign
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Sign up to participate and earn exclusive rewards.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 1 — Email Field */}
          <div>
            <Label className="py-3" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Step 2 — Show details only if new user */}
          {step === "full" && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 555 123 456"
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+ ]{7,15}$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") ||
                      "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </motion.div>
            </>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting
              ? "Please wait..."
              : step === "email"
              ? "Continue"
              : "Join Campaign"}
          </Button>
        </form>

        {isSuccess && (
          <motion.p
            className="text-green-600 text-sm text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
           You've been added! Welcome aboard.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export default function ParticipatePage() {
  return (
    <Suspense fallback={null}>
      <CampaignCustomerSignUp />
    </Suspense>
  );
}