import React from 'react';

import type { Metadata } from "next";
import FrontPageNavbar from '@/components/frontPageNavbar';
import Footer from "@/components/Footer";


export const metadata: Metadata = {
    title: {
        default: "Loyalty CardX",
        template: "%s — Loyalty CardX",
    },
    description: "Empowering local businesses with smart, simple loyalty programs.",
};
const OthersLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <FrontPageNavbar />
            <main className="min-h-screen bg-white text-gray-800 mt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default OthersLayout;
