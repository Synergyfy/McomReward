import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-6 md:px-8 mt-auto relative z-10 text-gray-650">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Row 1: Brand Logo & Navigation Links */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pb-8 border-b border-gray-200">
          
          {/* Logo and Slogan */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold font-headline-lg text-lg">M</span>
              </div>
              <span className="text-xl font-headline-lg font-bold text-orange-500 tracking-tight">MCOM</span>
            </Link>
            <p className="text-gray-400 text-xs max-w-sm">
              Empowering local businesses through smart, simple digital loyalty programs.
            </p>
          </div>

          {/* Horizontal Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-gray-600">
            <Link href="/about" className="hover:text-orange-500 transition-colors">About Us</Link>
            <Link href="/features" className="hover:text-orange-500 transition-colors">Features</Link>
            <Link href="/reward" className="hover:text-orange-500 transition-colors">Rewards</Link>
            <Link href="/pricing" className="hover:text-orange-500 transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-orange-500 transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
          </nav>

        </div>

        {/* Row 2: Copyright, Legal Links, and Social Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          
          {/* Copyright */}
          <div className="text-center md:text-left text-gray-500">
            © {new Date().getFullYear()} <span className="text-orange-500 font-bold">MCOM</span>. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-[10px] font-bold text-gray-550">
            <Link href="/terms" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
          </div>

          {/* Social Media Links */}
          <div className="flex gap-5 text-gray-400">
            <Link href="https://facebook.com" target="_blank" className="hover:text-orange-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-orange-500 transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-orange-500 transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-orange-500 transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
