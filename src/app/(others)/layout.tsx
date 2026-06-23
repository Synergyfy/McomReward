import React from 'react';
import type { Metadata } from "next";
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export const metadata: Metadata = {
    title: {
        default: "MCOM Rewards & Loyalty",
        template: "%s — MCOM",
    },
    description: "Empowering local businesses with smart, simple loyalty programs.",
};

const OthersLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-surface-bright">
            <PublicHeader />
            <main className="min-h-screen bg-white text-gray-800 mt-16">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
};

export default OthersLayout;
