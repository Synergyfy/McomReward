// pages/privacy.js
import Head from "next/head";
import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Loyalty CardX</title>
        <meta
          name="description"
          content="Learn how Loyalty CardX collects, uses, and protects your data."
        />
      </Head>

      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero section */}
      

<section className="bg-white py-16 text-center">
  <div className="max-w-3xl mx-auto px-6">
    <ShieldCheck className="w-12 h-12 mx-auto text-orange-500 mb-4" />
    <h1 className="text-4xl font-bold text-orange-500 mb-4">Privacy Policy</h1>
    <p className="text-gray-700 text-lg">
      Your privacy is important to us. This policy explains how we collect, use, and protect your information on Loyalty CardX.
    </p>
  </div>
</section>


        {/* Content section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">1. Information We Collect</h2>
              <p className="text-gray-700">
                We collect information you provide directly, such as account details, business information, and contact info. We also collect usage data and interactions with campaigns and QR codes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">2. How We Use Your Data</h2>
              <p className="text-gray-700">
                Your information is used to provide and improve our services, manage campaigns, issue points and rewards, and communicate important updates. We may use aggregated data for analytics and marketing insights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">3. Sharing Your Information</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We may share data with service providers for payment processing, printing assets, or analytics. Any third-party service is bound by confidentiality agreements.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">4. Data Security</h2>
              <p className="text-gray-700">
                We use industry-standard measures to protect your data. Access is restricted to authorized personnel only. However, no system is completely secure and we cannot guarantee absolute protection.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">5. Cookies & Tracking</h2>
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your experience, track usage, and provide analytics. You can manage cookie preferences in your browser settings.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">6. Your Rights</h2>
              <p className="text-gray-700">
                You can access, correct, or delete your personal information by contacting support. You may also opt out of marketing communications at any time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">7. Children’s Privacy</h2>
              <p className="text-gray-700">
                Loyalty CardX is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have, please contact us to remove it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-2">8. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy periodically. Continued use of the platform signifies acceptance of any updates. Material changes will be communicated via email or in-app notifications.
              </p>
                      </div>
                      <p className="text-gray-500 text-sm text-center mt-4">
  Last updated: October 2025
</p>


            <div className="text-center mt-8">
  <a
    href="/contact"
    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
  >
    Contact Support
  </a>
</div>

          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-6 border-t border-gray-200 text-center text-gray-500">
          © {new Date().getFullYear()} Loyalty CardX. All rights reserved.
        </footer>
      </main>
    </>
  );
}
