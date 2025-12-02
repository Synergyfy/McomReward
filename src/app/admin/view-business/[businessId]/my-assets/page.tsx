'use client';

import React, { useState } from 'react';
import { QrCode, Nfc, ScanLine, PoundSterling, Users, PlusCircle, Video, Megaphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation'; // Import useParams
import { useGetBusinessAssetOverview } from '@/services/business-assets/hook'; // Import the new hook


// --- Reusable Components ---

const StatCard = ({ title, value, icon: Icon, details }: { title: string, value: string | number, icon: React.ElementType, details?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {details && <p className="text-xs text-gray-400">{details}</p>}
      </div>
      <div className="bg-orange-100 text-orange-500 p-3 rounded-full">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ label, icon: Icon, disabled }: { label: string, icon: React.ElementType, disabled: boolean }) => (
    <Button className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-orange-600 transition-colors" disabled={disabled}>
        <Icon className="h-5 w-5" />
        {label}
    </Button>
);

// --- Tab Components ---

const OverviewTab = () => {
    const params = useParams();
    const businessId = params.businessId as string;

    const { data: assetOverviewData, isLoading, isError } = useGetBusinessAssetOverview({ businessId });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !assetOverviewData) {
        return <div className="text-center text-red-500 py-10">Error loading asset overview.</div>;
    }

    const isImpersonating = true; // Always true for this context, or derive from admin state

    return (
    <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="QR Plaques" value={assetOverviewData.qrPlaques.active} icon={QrCode} details={`Allocated: ${assetOverviewData.qrPlaques.allocated} | Assigned: ${assetOverviewData.qrPlaques.assigned} | Sold: ${assetOverviewData.qrPlaques.sold}`} />
            <StatCard title="NFC Cards Issued" value={assetOverviewData.nfcCards.issued} icon={Nfc} details={`Active: ${assetOverviewData.nfcCards.active} | Pending: ${assetOverviewData.nfcCards.pending}`} />
            <StatCard title="Scans & Redemptions" value={assetOverviewData.scansAndRedemptions.totalScans.toLocaleString()} icon={ScanLine} details={`Redemptions: ${assetOverviewData.scansAndRedemptions.totalRedemptions.toLocaleString()}`} />
            <StatCard title="Total Resale Revenue" value={`£${assetOverviewData.resaleRevenue.toLocaleString()}`} icon={PoundSterling} />
            <StatCard title="Partner Group Size" value={assetOverviewData.groupSize} icon={Users} />
        </div>
        {/* Quick Actions */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton label="Assign QR Plaque" icon={PlusCircle} disabled={isImpersonating} />
                <QuickActionButton label="Invite Partner" icon={Users} disabled={isImpersonating} />
                <QuickActionButton label="Create Offer" icon={Megaphone} disabled={isImpersonating} />
                <QuickActionButton label="Upload Storefront Video" icon={Video} disabled={isImpersonating} />
            </div>
        </div>
    </div>
)};



export default function MyAssetsPage() {
    return (
        <OverviewTab />
    );
}
