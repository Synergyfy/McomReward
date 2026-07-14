// pages/terms.js
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Loyalty CardX",
  description:
    "Read the Terms & Conditions for using Loyalty CardX platform.",
};

export default function Terms() {
  return (
    <>
      
      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero section */}
        <section className="bg-white py-16 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-4xl font-bold text-orange-500 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-700 text-lg">
              Please read these terms carefully before using the Loyalty CardX platform.
            </p>
          </div>
        </section>

        {/* Content section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using Loyalty CardX, you agree to be bound by these Terms & Conditions. If you do not agree, do not use the platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">2. Use of Services</h2>
              <p className="text-gray-700">
                You may use our services only for lawful purposes. Businesses must provide accurate information when claiming templates, creating campaigns, or inviting others.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">3. Points, Rewards & Vouchers</h2>
              <p className="text-gray-700">
                Points and rewards are non-transferable except as allowed by the platform. Redemption is subject to verification and may require Proof of Delivery for perishable items.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">4. Intellectual Property</h2>
              <p className="text-gray-700">
                All content, logos, graphics, and templates provided on Loyalty CardX are the property of Loyalty CardX and protected by copyright laws. Unauthorized use is prohibited.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">5. Privacy & Data</h2>
              <p className="text-gray-700">
                We collect and process data according to our Privacy Policy. By using the platform, you consent to this data collection and use.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">6. Limitation of Liability</h2>
              <p className="text-gray-700">
                Loyalty CardX is not responsible for any indirect, incidental, or consequential damages arising from the use of the platform. Use the service at your own risk.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">7. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms occasionally. Continued use of the platform indicates acceptance of the updated terms. Users will be notified of material changes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">8. Contact</h2>
              <p className="text-gray-700">
                For questions about these Terms & Conditions, please contact us at <a href="mailto:support@mcomrewards.com" className="text-orange-500">support@mcomrewards.com</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
