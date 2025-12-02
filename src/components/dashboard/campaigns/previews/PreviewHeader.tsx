
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PreviewHeader() {
  const params = useParams();
  const { businessId, campaignId } = params; // Extract businessId and campaignId

  const navLinks = [
    { href: `/admin/view-business/${businessId}/campaigns/preview/${campaignId}/overview`, label: 'OVERVIEW' },
    { href: `/admin/view-business/${businessId}/campaigns/preview/${campaignId}/earn-points`, label: 'EARN POINTS' },
    { href: `/admin/view-business/${businessId}/campaigns/preview/${campaignId}/redeem-points`, label: 'REDEem POINTS' },
    { href: `/admin/view-business/${businessId}/campaigns/preview/${campaignId}/contact-us`, label: 'CONTACT US' },
  ];

  return (
    <header className="relative bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-center items-center p-4">
        <nav>
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
