"use client";

import { useState} from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStaffLogin } from "@/services/staff/hook";
import FakeTurnstile from "@/components/ui/turnstile";

type StaffLoginForm = {
  email: string;
  password: string;
};

type ForgotPasswordForm = {
  email: string;
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [forgotLoading, setForgotLoading] = useState(false);

  const { mutateAsync: staffLogin, isPending } = useStaffLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginForm>();

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotPasswordForm>();

  // ✅ Login handler
  const onSubmit = async (data: StaffLoginForm) => {
    try {
      await staffLogin({ ...data,});
      router.push("/staff/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  // ✅ Forgot password handler
  const onForgotSubmit = async (data: ForgotPasswordForm) => {
    setForgotLoading(true);
    try {
      const res = await fetch("/api/staff/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send reset link");

      toast.success("Password reset link sent!");
      resetForgot();
    } catch {
      toast.error("Could not send reset link. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Staff Login
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Please log in with your staff credentials
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="staff@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Turnstile widget */}
         <FakeTurnstile onVerify={(token) => setTurnstileToken(token)} />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-2 mt-3"
          >
            {isPending ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" />
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm text-black hover:text-orange-600 underline">
                Forgot your password?
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset your password</DialogTitle>
                <DialogDescription>
                  Enter your email address and we’ll send you a reset link.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleForgotSubmit(onForgotSubmit)}
                className="space-y-4 mt-2"
              >
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="staff@example.com"
                    {...registerForgot("email", {
                      required: "Email is required",
                    })}
                  />
                  {forgotErrors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {forgotErrors.email.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {forgotLoading ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have a staff account? Contact your business admin.
        </p>
      </motion.div>
    </div>
  );
}
