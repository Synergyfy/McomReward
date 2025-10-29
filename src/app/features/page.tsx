import Head from "next/head";
import {
  Rocket,
  Gift,
  BarChart3,
  Users,
  Shield,
  HelpCircle,
  Download,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Campaign Builder",
    description:
      "Create campaigns in minutes using pre-built templates. Customize points, rewards, and dates, then publish instantly. QR codes and posters are generated automatically.",
  },
  {
    icon: Gift,
    title: "Points & Rewards",
    description:
      "Track customer points, issue vouchers, and view redemptions. Customers can easily redeem in-store or online, with real-time updates to your dashboard.",
  },
  {
    icon: Download,
    title: "Marketing Assets",
    description:
      "Download QR codes, posters, and social media images. Order professional prints with one click, ready to display in-store or share online.",
  },
  {
    icon: Users,
    title: "Invite & Affiliate System",
    description:
      "Invite nearby businesses or customers using a unique link or QR. Earn bonus points and ladder rewards for every successful referral.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Monitor campaign performance, points issued vs redeemed, and ROI. Export CSV reports and visualize redemption trends over the last 30 days.",
  },
  {
    icon: Wallet,
    title: "Customer Wallet",
    description:
      "Customers can track points, redeem vouchers, and view transaction history. Perishable rewards support Proof of Delivery for accurate redemption.",
  },
  {
    icon: Shield,
    title: "Secure & Role-Based",
    description:
      "Businesses see only their own data, customers see their points and vouchers, and admins have limited access for support and operations.",
  },
  {
    icon: HelpCircle,
    title: "Training & Help",
    description:
      "Step-by-step tutorials and videos help you and your team start quickly, minimizing support needs and onboarding time.",
  },
];

export default function Features() {
  return (
    <>
      <Head>
        <title>Features — Loyalty CardX</title>
        <meta
          name="description"
          content="Explore the features of Loyalty CardX for businesses and customers."
        />
      </Head>

      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 py-24 text-center text-white">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-white opacity-90" />
            <h1 className="text-5xl font-extrabold mb-4">Powerful Features</h1>
            <p className="text-orange-50 text-lg max-w-2xl mx-auto">
              Discover everything Loyalty CardX offers to help your business
              grow, reward customers, and track performance — all in one place.
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300 bg-white hover:-translate-y-1"
            >
              <div className="bg-orange-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Icon className="text-orange-500" size={26} />
              </div>
              <h2 className="text-xl font-semibold text-orange-600 mb-2">
                {title}
              </h2>
              <p className="text-gray-700">{description}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-orange-50 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">
              Ready to Launch Your First Campaign?
            </h2>
            <p className="text-gray-700 mb-8">
              Get started in minutes — build campaigns, issue rewards, and watch
              your customer engagement grow effortlessly.
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Go to Dashboard
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-8 border-t border-gray-200 text-center text-gray-500">
          © {new Date().getFullYear()} Loyalty CardX. All rights reserved.
        </footer>
      </main>
    </>
  );
}
