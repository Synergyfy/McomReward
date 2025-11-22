'use client';

import React, { useState } from 'react';
import PlaqueUserSidebar from '@/components/plaque-user/sidebar';
import PlaqueUserHeader from '@/components/plaque-user/header';

export default function PlaqueUserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 md:flex">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <PlaqueUserSidebar isOpen={isSidebarOpen} />

            {/* Main content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <PlaqueUserHeader onMenuClick={toggleSidebar} />
                <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
