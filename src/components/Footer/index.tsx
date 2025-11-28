import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-gray-200 py-12 px-8 flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center md:text-left">
        
        {/* 1️⃣ Branding & Description */}
        <div>
          <h3 className="text-3xl font-bold text-orange-500 mb-4">Mcom Reward</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Mcom Reward helps local businesses grow through digital rewards,
            tiered loyalty programs, and engaging customer experiences.
          </p>

          {/* 🌐 Social Links */}
          <div className="flex justify-center md:justify-start gap-4 text-gray-500">
            <Link href="https://facebook.com" target="_blank" className="hover:text-orange-500 transition">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-orange-500 transition">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-orange-500 transition">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-orange-500 transition">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* 2️⃣ Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-orange-500 mb-4">Quick Links</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link href="/about" className="hover:text-orange-500 transition">About Us</Link></li>
            <li><Link href="/features" className="hover:text-orange-500 transition">Features</Link></li>
            <li><Link href="/rewards" className="hover:text-orange-500 transition">Rewards</Link></li>
            <li><Link href="/pricing" className="hover:text-orange-500 transition">Pricing</Link></li>
          </ul>
        </div>

        {/* 3️⃣ Support Links */}
        <div>
          <h4 className="text-lg font-semibold text-orange-500 mb-4">Support</h4>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link href="/faq" className="hover:text-orange-500 transition">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
            <li><Link href="/terms" className="hover:text-orange-500 transition">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* 4️⃣ Newsletter / CTA (optional) */}
        <div className="hidden lg:block">
          <h4 className="text-lg font-semibold text-orange-500 mb-4">Stay Connected</h4>
          <p className="text-gray-600 text-sm mb-4">
            Join our newsletter for the latest loyalty marketing tips and updates.
          </p>
          <form className="flex flex-col  gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 flex-grow"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} <span className="text-orange-500 font-semibold">Mcom Reward</span>. All rights reserved.
      </div>
    </footer>
  );
}
