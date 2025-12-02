'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { CheckCircle2 } from 'lucide-react'

// Inner component (actually uses the hook)
function ConfirmationContent() {
  const params = useSearchParams()
  const plan = params.get('plan') || 'Bronze'
  const billing = params.get('billing') || 'quarterly'

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-foreground/80">
          Welcome to the {plan} plan.
        </p>
        <p className="text-foreground/60 mt-2">
          Your {billing} subscription has been activated.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-border p-6 bg-card hover:border-primary/20 transition-colors">
          <h2 className="font-semibold text-lg mb-2">🚀 Next Steps</h2>
          <p className="text-foreground/80 mb-4">
            We are preparing your account. Here is what you can expect:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
              <span><strong>NFC Card:</strong> Your physical NFC card will be shipped within 10 business days.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
              <span><strong>Digital Assets:</strong> QR codes and marketing materials will be emailed to you shortly.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
              <span><strong>Onboarding:</strong> Look out for an email to schedule your personalized onboarding session.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-border p-6 bg-card">
          <h2 className="font-semibold mb-2">Need Help?</h2>
          <p className="text-foreground/80">
            If you have any questions about your subscription or next steps, please contact our support team at{' '}
            <a className="underline text-primary hover:text-primary/80" href="mailto:support@mcomreward.com">
              support@mcomreward.com
            </a>.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-center hover:bg-primary/90 transition-colors">
          Go to Dashboard
        </Link>
        <Link href="/" className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border font-semibold text-center hover:bg-muted transition-colors">
          Return to Home
        </Link>
      </div>
    </main>
  )
}

// Outer wrapper (Suspense boundary)
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
