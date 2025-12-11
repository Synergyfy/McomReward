"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useVerifyEmail, useResendOtp } from "@/services/auth/hook";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const { mutateAsync: verifyEmail, isPending } = useVerifyEmail();
    const { mutateAsync: resendOtp, isPending: isResending } = useResendOtp();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            toast.error("Please enter a valid OTP");
            return;
        }

        if (!email) {
            toast.error("Email is missing. Please login again.");
            router.push("/login");
            return;
        }

        try {
            await verifyEmail({ email, otp });
            toast.success("Email verified successfully!");

            // Check stored onboarding status (captured at login)
            const isOnboarded = localStorage.getItem('isOnboarded') === 'true';

            if (isOnboarded) {
                router.push("/dashboard");
            } else {
                router.push("/business/onboard");
            }

        } catch (error: any) {
            console.error("Verification failed:", error);
            toast.error(error?.response?.data?.message || "Verification failed. Please check your OTP.");
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("Email is missing. Please login again.");
            return;
        }

        try {
            await resendOtp({ email });
            toast.success("OTP resent successfully! Check your email.");
        } catch (error: any) {
            console.error("Resend failed:", error);
            toast.error(error?.response?.data?.message || "Failed to resend OTP. Please try again.");
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">Email Missing</h2>
                    <p className="text-gray-500 mt-2">We couldn't find your email address to verify.</p>
                    <Button onClick={() => router.push("/login")} className="mt-4" variant="outline">Back to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-2">
                        <Mail className="w-8 h-8" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            We've sent a verification code to <br />
                            <span className="font-semibold text-gray-800 text-base">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="w-full space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-semibold text-gray-500 tracking-wider ml-1">
                                Verification Code
                            </label>
                            <Input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 h-14 text-2xl tracking-[0.5em] text-center font-bold text-gray-800 rounded-xl transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400"
                                maxLength={8}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                            )}
                            {isPending ? "Verifying..." : "Verify Email"}
                        </Button>
                    </form>

                    <div className="text-sm text-gray-500">
                        Didn't receive the code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                        >
                            {isResending ? "Sending..." : "Resend"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
