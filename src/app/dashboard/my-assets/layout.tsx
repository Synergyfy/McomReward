'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AssetNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className={`px-4 py-2 ${isActive ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}>
            {children}
        </Link>
    );
};

export default function MyAssetsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">My Assets</h1>
            <div className="flex border-b">
                <AssetNavLink href="/dashboard/my-assets">Overview</AssetNavLink>
                <AssetNavLink href="/dashboard/my-assets/qr-plaques">QR Plaques</AssetNavLink>
                <AssetNavLink href="/dashboard/my-assets/nfc-cards">NFC Cards</AssetNavLink>
                <AssetNavLink href="/dashboard/my-assets/storefront-media">Storefront & Media</AssetNavLink>
                <AssetNavLink href="/dashboard/my-assets/marketing-materials">Marketing Materials</AssetNavLink>
                <AssetNavLink href="/dashboard/my-assets/partner-network">Partner Network</AssetNavLink>
                <AssetNavLink href="/dashboard/my-assets/revenue-analytics">Revenue & Analytics</AssetNavLink>
            </div>
            <div className="pt-6">
                {children}
            </div>
        </div>
    );
}
