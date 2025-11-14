"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

interface CustomerSignUpForm {
  name?: string;
  email: string;
  phone?: string;
}
 

  export default function CampaignCustomerSignUp({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerSignUpForm>();




  const [step, setStep] = useState<"email" | "full">("email");
  const [isSuccess, setIsSuccess] = useState(false);

  const email = watch("email");

  // 🧪 Mock backend check for email
  const checkEmailExists = async (email: string) => {
    await new Promise((res) => setTimeout(res, 1000)); // fake delay
    const mockExistingEmails = ["test@example.com", "hello@demo.com"];
    return mockExistingEmails.includes(email.toLowerCase());
  };

  const onSubmit = async (data: CustomerSignUpForm) => {
    try {
      if (step === "email") {
        const exists = await checkEmailExists(data.email);

        if (exists) {
          toast.success("Welcome back! You’ve been automatically enrolled 🎉");
          setIsSuccess(true);
          reset();
          return;
        }

        toast.info("No existing account found. Please complete your details.");
        setStep("full");
        return;
      }

      // 👇 Simulate backend sign-up (replace with your actual API)
      const response = await api.post("/customers/signup", data);
      toast.success("Customer account created successfully!");
      console.log("Customer created:", response.data);

      setIsSuccess(true);
      reset();
      onSuccess?.(); // ✅ notify parent modal
    } catch (error) {
      console.error("Customer creation failed:", error);
      toast.error("Failed to sign up customer.");
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

          {/* Step 2 — Show name + phone only if new user */}
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
                    required: "Phone number is required",
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
           You’ve been added! Welcome aboard.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
