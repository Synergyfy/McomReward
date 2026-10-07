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
        <div className="space-y-4 sm:space-y-6 w-full">
            {!isGroupCirclesPage && (
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Network</h1>
            )}
            <div className={isGroupCirclesPage ? "" : "pt-1 sm:pt-2"}>
                {children}
            </div>
        </div>
    );
}
