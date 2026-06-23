"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Rewards', href: '/reward', icon: 'redeem' },
  { label: 'Brands', href: '/brands', icon: 'stars' },
  { label: 'Gift Cards', href: '/gift-cards', icon: 'card_giftcard' },
];

const sheetItems = [
  { label: 'Local Discovery', href: '/local-discovery', icon: 'explore' },
  { label: 'Offers & Deals', href: '/deals', icon: 'local_offer' },
  { label: 'Play & Win', href: '/play-win', icon: 'sports_esports' },
  { label: 'Events', href: '/events', icon: 'event' },
  { label: 'Refer Friends', href: '/refer', icon: 'group_add' },
  { label: 'Membership Tiers', href: '/membership', icon: 'workspace_premium' },
  { label: 'For Businesses', href: '/business', icon: 'storefront' },
  { label: 'About MCOM', href: '/about', icon: 'info' },
  { label: 'Help & Support', href: '/faq', icon: 'help' },
  { label: 'Contact Us', href: '/contact', icon: 'mail' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleToggleSheet = () => {
    setIsSheetOpen(!isSheetOpen);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-20 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] transition-all duration-200 ${
                active
                  ? 'text-orange-500 font-semibold scale-105'
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px] mb-0.5"
                style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={handleToggleSheet}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] transition-all duration-200 ${
            isSheetOpen
              ? 'text-orange-500 font-semibold scale-105'
              : 'text-gray-500 hover:text-orange-500'
          }`}
          aria-label="More menu"
        >
          <span className="material-symbols-outlined text-[24px] mb-0.5">
            {isSheetOpen ? 'close' : 'more_horiz'}
          </span>
          <span className="text-[10px] tracking-wide">More</span>
        </button>
      </nav>

      {/* Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleToggleSheet}
              className="md:hidden fixed inset-0 z-40 bg-black backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="md:hidden fixed bottom-20 left-0 w-full z-45 max-h-[70vh] overflow-y-auto bg-white rounded-t-[32px] border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] pb-10"
            >
              {/* Drawer Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              <div className="px-6 py-4">
                <h3 className="text-lg font-bold text-gray-800 mb-5">Explore MCOM Ecosystem</h3>
                
                {/* 2-Column Bento Grid Layout for Drawer Items */}
                <div className="grid grid-cols-2 gap-3">
                  {sheetItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSheetOpen(false)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 ${
                          active
                            ? 'bg-orange-50 border-orange-200 text-orange-600'
                            : 'bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            active ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
