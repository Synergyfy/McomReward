
'use client'

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-lg mb-8">Your subscription has been updated.</p>
        <Link href="/" className="underline text-primary">
          Go to your dashboard
        </Link>
      </div>
    </main>
  );
}
