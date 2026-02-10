'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function MyAssetsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isGroupCirclesPage = pathname.includes('/group-circles');

    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
            {!isGroupCirclesPage && (
                <h1 className="text-3xl font-bold text-gray-800">My Network</h1>
            )}
            <div className={isGroupCirclesPage ? "" : "pt-6"}>
                {children}
            </div>
        </div>
    );
}
