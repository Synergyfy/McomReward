'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    QrCode,
    Share2,
    Download,
    Scan,
    Gift,
    DollarSign,
    Settings,
    HelpCircle,
    LogOut
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
}

export default function PlaqueUserSidebar({ isOpen }: SidebarProps) {
    const pathname = usePathname();

    const linkClasses = (path: string) => {
        const isActive = pathname === path || pathname.startsWith(`${path}/`);
        // Handle root path specifically to avoid matching everything
        if (path === '/plaque-user' && pathname !== '/plaque-user') {
            return `flex items-center p-2 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-orange-100 hover:text-orange-600`;
        }

        return `flex items-center p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`;
    };

    return (
        <div
            className={`
        fixed top-0 left-0 h-full w-64 bg-white text-gray-800 z-40 shadow-lg
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}
        >
            <div className="p-4 pb-6 border-b">
                <h2 className="text-xl font-bold text-orange-600">Plaque Dashboard</h2>
                <p className="text-xs text-gray-500 mt-1">Manage your plaques</p>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    <li>
                        <Link href="/plaque-user" className={linkClasses("/plaque-user")}>
                            <LayoutDashboard className="mr-3 h-5 w-5" />
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/plaque-user/plaques" className={linkClasses("/plaque-user/plaques")}>
                            <QrCode className="mr-3 h-5 w-5" />
                            My Plaques
                        </Link>
                    </li>
                    <li>
                        <Link href="/plaque-user/share" className={linkClasses("/plaque-user/share")}>
                            <Share2 className="mr-3 h-5 w-5" />
                            Share & Campaigns
                        </Link>
                    </li>
                    <li>
                        <Link href="/plaque-user/downloads" className={linkClasses("/plaque-user/downloads")}>
                            <Download className="mr-3 h-5 w-5" />
                            Downloads & Print
                        </Link>
                    </li>
                    <li>
                        <Link href="/plaque-user/scans" className={linkClasses("/plaque-user/scans")}>
                            <Scan className="mr-3 h-5 w-5" />
                            Scans & Activity
                        </Link>
                    </li>
                    <li>
                        <Link href="/plaque-user/offers" className={linkClasses("/plaque-user/offers")}>
                            <Gift className="mr-3 h-5 w-5" />
                            Offers & Redemptions
                        </Link>
                    </li>
                    <li>
                        <Link href="/plaque-user/earnings" className={linkClasses("/plaque-user/earnings")}>
                            <DollarSign className="mr-3 h-5 w-5" />
                            Earnings
                        </Link>
                    </li>
                </ul>

                <div className="mt-6 px-3">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-2">Account</div>
                    <ul className="space-y-1">
                        <li>
                            <Link href="/plaque-user/settings" className={linkClasses("/plaque-user/settings")}>
                                <Settings className="mr-3 h-5 w-5" />
                                Settings
                            </Link>
                        </li>
                        <li>
                            <Link href="/plaque-user/help" className={linkClasses("/plaque-user/help")}>
                                <HelpCircle className="mr-3 h-5 w-5" />
                                Help & Support
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="p-4 border-t">
                <button className="flex items-center w-full p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <LogOut className="mr-3 h-5 w-5" />
                    Log Out
                </button>
            </div>
        </div>
    );
}
