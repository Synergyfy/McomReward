"use client";

import { useState, useRef } from "react";
import { useForm} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SignupData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  birthday?: string;
  gender?: string;
  location?: string;
  agree: boolean;
};

export default function CustomerSignupPage() {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
      register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>();

  // Simulate sending OTP
  const onSubmit = async (data: SignupData) => {
    console.log(`User agreed to terms: ${data.agree}`);
    if (!data.agree) {
      toast.error("You must agree to the Terms & Conditions.");
      return;
    }

    toast.loading("Sending OTP...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.dismiss();
    toast.success("OTP sent to your email/phone!");
    setOtpSent(true);
  };

  const handleGoogleSignup = () => {
    toast.info("Redirecting to Google Sign-In...");
    // TODO: integrate Google OAuth flow here
  };

  // Handle OTP verification
  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      setOtpLoading(false);
      return;
    }

    toast.loading("Verifying OTP...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.dismiss();
    toast.success("Account created successfully! 🎉");
    setOtpLoading(false);
    router.push("/redemption");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white ">
      <div className="w-full max-w-md bg-white rounded-2xl  p-8 space-y-6">
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

        {/* STEP 1 — SIGNUP FORM */}
        {!otpSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName.message}</p>
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
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="+2348012345678"
                {...register("phone", { required: "Phone number is required" })}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
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

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Birthday</Label>
                <Input type="date" {...register("birthday")} />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  {...register("gender")}
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Input
                placeholder="e.g. Lagos, Nigeria"
                {...register("location")}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Join MCOM Rewards"}
            </Button>
          </form>
        ) : (
          /* STEP 2 — OTP VERIFICATION */
          <form onSubmit={handleSubmitOtp} className="space-y-5 text-center">
            <h3 className="text-lg font-medium text-gray-800">
              Enter OTP Verification Code
            </h3>
            <Input
              ref={inputRef}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-xl tracking-widest"
            />
            <Button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {otpLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
