"use client";

import { useState } from "react";
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
import { toast } from "sonner"; // or your toast lib (shadcn, react-hot-toast, etc.)
import {useStaffLogin} from "@/services/staff/hook";

type StaffLoginForm = {
  email: string;
  password: string;
};

type ForgotPasswordForm = {
  email: string;
};

export default function StaffLoginPage() {
const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

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
    
    const { mutateAsync: staffLogin, isPending } = useStaffLogin();

  // ✅ Login handler
  const onSubmit = async (data: StaffLoginForm) => {
      setLoading(isPending);
      try {
          await staffLogin(data);
          router.push("/staff/dashboard");
      } catch (error) {
          console.log("Login error:", error);
          toast.error("Login failed. Please check your email and password.");
        }
 finally {
      setLoading(false);
    }
  };

  // ✅ Forgot password handler
  const onForgotSubmit = async (data: ForgotPasswordForm) => {
    setForgotLoading(true);
    try {
      // Example API — replace with your backend route
      const response = await fetch("/api/staff/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error sending reset email");

      alert("Password reset link sent to your email!");
      resetForgot();
    } catch {
      alert("Could not send reset link. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 p-4">
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
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full py-2 mt-2"
          >
            {loading ? (
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
              <button className="text-sm text-pink-600 hover:text-pink-700 underline">
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
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
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
                    className="bg-pink-600 hover:bg-pink-700 text-white"
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
