'use client';

import React from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

const PreviewHeader = () => {
  const pathname = usePathname();
  const params = useParams();
  const { campaignId } = params;

  const navLinks = [
    { href: `/admin/campaigns/${campaignId}/overview`, label: 'Overview' },
    { href: `/admin/campaigns/${campaignId}/earn-points`, label: 'Earn Points' },
    { href: `/admin/campaigns/${campaignId}/redeem-points`, label: 'Redeem Points' },
    { href: `/admin/campaigns/${campaignId}/contact-us`, label: 'Contact Us' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === link.href
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default PreviewHeader;
