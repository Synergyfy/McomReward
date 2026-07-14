'use client'

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { usePayPalVerify } from "@/services/payment/hook"
import { toast } from "sonner"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"

function PayPalReturnContent() {
    const params = useSearchParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')

    const token = params.get("token") // PayPal transaction ID
    const plan = params.get("plan") || "Bronze"
    const billing = params.get("billing") || "quarterly"

    const { mutate: verifyPayment, isPending } = usePayPalVerify()

    useEffect(() => {
        if (!token) {
            setVerificationStatus('error')
            toast.error("No transaction ID found")
            return
        }

        // Call verify endpoint
        verifyPayment(
            { transactionId: token },
            {
                onSuccess: (data) => {
                    console.log("PayPal verification response:", data)

                    // Invalidate queries to update subscription status
                    queryClient.removeQueries({ queryKey: ['businessSubscription'] })
                    queryClient.removeQueries({ queryKey: ['subscription'] })
                    queryClient.invalidateQueries({ queryKey: ['tiers'] })

                    setVerificationStatus('success')
                    toast.success("Payment verified successfully!")

                    // Redirect to confirmation page after 2 seconds
                    setTimeout(() => {
                        router.push(`/checkout/confirmation?plan=${encodeURIComponent(plan)}&billing=${billing}&status=success`)
                    }, 2000)
                },
                onError: (error) => {
                    console.error("PayPal verification failed:", error)
                    setVerificationStatus('error')
                    toast.error("Payment verification failed")
                }
            }
        )
    }, [token, verifyPayment, router, plan, billing])

    return (
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto py-16">
            <div className="text-center">
                {verificationStatus === 'pending' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4">Verifying Your Payment</h1>
                        <p className="text-foreground/70 mb-8">
                            Please wait while we confirm your PayPal payment...
                        </p>
                    </>
                )}

                {verificationStatus === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4">Payment Verified!</h1>
                        <p className="text-foreground/70 mb-8">
                            Your payment has been successfully verified. Redirecting to confirmation...
                        </p>
                    </>
                )}

                {verificationStatus === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
                        <p className="text-foreground/70 mb-8">
                            We couldn't verify your payment. Please contact support if the issue persists.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/pricing"
                                className="px-6 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                            >
                                Back to Pricing
                            </Link>
                            <Link
                                href={`/checkout?plan=${encodeURIComponent(plan)}&billing=${billing}`}
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Try Again
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}

export default function PayPalReturnPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <PayPalReturnContent />
        </Suspense>
    )
}
