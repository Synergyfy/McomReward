'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

// Inner component (actually uses the hook)
function ConfirmationContent() {
  const params = useSearchParams()
  const plan = params.get('plan') || 'Bronze'
  const billing = params.get('billing') || 'quarterly'

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">You're all set!</h1>
      <p className="text-foreground/80 mb-10">
        Your {plan} membership ({billing}) has been activated. Here’s what happens next:
      </p>

      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-border p-5 bg-card">
          <h2 className="font-semibold mb-2">NFC Card</h2>
          <p className="text-foreground/80">Your physical NFC card will be sent within 10 working days.</p>
        </div>
        <div className="rounded-2xl border-2 border-border p-5 bg-card">
          <h2 className="font-semibold mb-2">QR Codes</h2>
          <p className="text-foreground/80">We’ll provision your QR codes and email you the assets shortly.</p>
        </div>
        <div className="rounded-2xl border-2 border-border p-5 bg-card">
          <h2 className="font-semibold mb-2">Onboarding</h2>
          <p className="text-foreground/80">An onboarding session will be scheduled via email within 2 business days.</p>
        </div>
        <div className="rounded-2xl border-2 border-border p-5 bg-card">
          <h2 className="font-semibold mb-2">Support</h2>
          <p className="text-foreground/80">
            Need help? Contact your support person at{' '}
            <a className="underline" href="mailto:support@example.com">
              support@example.com
            </a>.
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Link href="/" className="underline">
          Back to Pricing
        </Link>
        <Link href="/" className="px-6 py-3 rounded-full bg-primary text-primary-foreground">
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}

// Outer wrapper (Suspense boundary)
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
