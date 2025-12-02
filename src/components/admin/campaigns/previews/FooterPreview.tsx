'use client';

import React from 'react';
import Link from 'next/link';

interface FooterPreviewProps {
  campaignData: {
    footerText?: string;
  };
}

export default function FooterPreview({ campaignData }: FooterPreviewProps) {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <p>{campaignData.footerText || '© 2025 Mcom Loyalty. All rights reserved.'}</p>
        <div className="flex justify-center space-x-4 mt-4">
          <Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link>
          <Link href="#" className="text-gray-400 hover:text-white">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
