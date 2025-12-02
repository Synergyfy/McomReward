'use client';

import React from 'react';

export default function MyAssetsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">My Assets</h1>
            <div className="pt-6">
                {children}
            </div>
        </div>
    );
}
