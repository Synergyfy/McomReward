'use client';

import React, { useState, useEffect } from 'react';
import { Download, Link as LinkIcon, Pencil, Trash2, MoreVertical, Settings, Plus, Printer, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import Link from 'next/link';
import { useGetMySubscription } from '@/services/tiers/hook';
import { PlaquePreview } from '@/components/plaque/PlaquePreview';

// Import Modals
import AssignPartnerModal from '@/components/dashboard/my-assets/qr-plaques/AssignPartnerModal';
import MarkForSaleModal from '@/components/dashboard/my-assets/qr-plaques/MarkForSaleModal';
import ConfigurePlaqueModal from '@/components/dashboard/my-assets/qr-plaques/ConfigurePlaqueModal';
import DeactivateConfirmationModal from '@/components/dashboard/my-assets/qr-plaques/DeactivateConfirmationModal';
import PlaqueDetailsModal from '@/components/dashboard/my-assets/qr-plaques/PlaqueDetailsModal';

// Enhanced mock data
const initialQrPlaquesData = [
  { id: 'Plaque-001', partner: 'Coffee House', status: 'Active', scans: 120, redemptions: 30, linkedOffer: 'Summer Voucher ($50)', price: null },
  { id: 'Plaque-002', partner: 'Bookstore', status: 'Active', scans: 75, redemptions: 15, linkedOffer: 'Discount Coupon (20% off)', price: null },
  { id: 'Plaque-003', partner: 'Unassigned', status: 'Inactive', scans: 0, redemptions: 0, linkedOffer: null, price: null },
  { id: 'Plaque-004', partner: 'Unassigned', status: 'For Sale', scans: 0, redemptions: 0, linkedOffer: null, price: '£25.00' },
  { id: 'Plaque-005', partner: 'Pending Assignment (gym@example.com)', status: 'Pending Assignment', scans: 0, redemptions: 0, linkedOffer: null, price: null },
];

const chartData = [
    { name: 'Mon', scans: 400, redemptions: 240 },
    { name: 'Tue', scans: 300, redemptions: 139 },
    { name: 'Wed', scans: 200, redemptions: 980 },
    { name: 'Thu', scans: 278, redemptions: 390 },
    { name: 'Fri', scans: 189, redemptions: 480 },
    { name: 'Sat', scans: 239, redemptions: 380 },
    { name: 'Sun', scans: 349, redemptions: 430 },
];

// Define a type that covers both initial data and saved plaques
interface Plaque {
    id: string;
    partner: string;
    status: string;
    scans: number;
    redemptions: number;
    linkedOffer: string | null;
    price: string | null;
    // Optional fields for saved templates
    actionText?: string;
    description?: string;
    extraInfo?: string;
    qrCodeUrl?: string;
}

// Fallback limits if API qrCodeCount is missing
const TIER_LIMITS: Record<string, number> = {
    'Bronze Plan': 5,
    'Silver Plan': 10,
    'Gold Plan': 20,
    'Platinum Plan': 50
};

export default function QRPlaquesPage() {
    const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
    const [plaques, setPlaques] = useState<Plaque[]>(initialQrPlaquesData);
    const [selectedPlaque, setSelectedPlaque] = useState<Plaque | null>(null);

    // Subscription Hook
    // We also check isError to gracefully fallback
    const { data: subscription, isLoading: isSubscriptionLoading, isError } = useGetMySubscription();

    // Calculate Max Plaques
    let maxPlaques = 5;

    if (subscription?.tier) {
        if (typeof subscription.tier.qrCodeCount === 'number' && subscription.tier.qrCodeCount > 0) {
            maxPlaques = subscription.tier.qrCodeCount;
        } else if (subscription.tier.name) {
            const tierName = subscription.tier.name;
            if (TIER_LIMITS[tierName]) {
                maxPlaques = TIER_LIMITS[tierName];
            } else {
                const lowerName = tierName.toLowerCase();
                if (lowerName.includes('platinum')) maxPlaques = 50;
                else if (lowerName.includes('gold')) maxPlaques = 20;
                else if (lowerName.includes('silver')) maxPlaques = 10;
                else if (lowerName.includes('bronze')) maxPlaques = 5;
            }
        }
    }

    const currentCount = plaques.length;
    const isLimitReached = maxPlaques !== -1 && currentCount >= maxPlaques;

    // Print State
    const [plaqueToPrint, setPlaqueToPrint] = useState<Plaque | null>(null);

    // View Details State
    const [viewPlaque, setViewPlaque] = useState<Plaque | null>(null);

    // Modal states
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isSaleModalOpen, setSaleModalOpen] = useState(false);
    const [isConfigureModalOpen, setConfigureModalOpen] = useState(false);
    const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);

    useEffect(() => {
        // Load saved plaques from local storage
        try {
            const saved = JSON.parse(localStorage.getItem('my_plaques_list') || '[]');
            if (saved.length > 0) {
                setPlaques([...initialQrPlaquesData, ...saved]);
            }
        } catch (e) {
            console.error("Failed to load saved plaques", e);
        }
    }, []);

    // Effect to trigger print
    useEffect(() => {
        if (plaqueToPrint) {
            const timer = setTimeout(() => {
                window.print();
                setPlaqueToPrint(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [plaqueToPrint]);

    // Handlers
    const handleOpenModal = (plaque: Plaque, modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setSelectedPlaque(plaque);
        modalSetter(true);
    };

    const handleAssign = (partnerDetails: { email: string }) => {
        if (!selectedPlaque) return;
        setPlaques(plaques.map(p => p.id === selectedPlaque.id ? { ...p, status: 'Pending Assignment', partner: `Pending (${partnerDetails.email})` } : p));
        setAssignModalOpen(false);
    };

    const handleMarkForSale = (price: string) => {
        if (!selectedPlaque) return;
        setPlaques(plaques.map(p => p.id === selectedPlaque.id ? { ...p, status: 'For Sale', price, linkedOffer: null } : p));
        setSaleModalOpen(false);
    };

    const handleConfigure = (config: { linkedOffer: string }) => {
        if (!selectedPlaque) return;
        setPlaques(plaques.map(p => p.id === selectedPlaque.id ? { ...p, linkedOffer: config.linkedOffer, price: null, status: 'Active' } : p));
        setConfigureModalOpen(false);
    };

    const handleDeactivate = () => {
        if (!selectedPlaque) return;
        setPlaques(plaques.map(p => p.id === selectedPlaque.id ? { ...p, status: 'Inactive' } : p));
        setDeactivateModalOpen(false);
    };

    const handlePrint = (plaque: Plaque) => {
        setPlaqueToPrint(plaque);
    };

    const handleViewDetails = (plaque: Plaque) => {
        setViewPlaque(plaque);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            case 'For Sale': return 'bg-yellow-100 text-yellow-800';
            case 'Pending Assignment': return 'bg-blue-100 text-blue-800';
            case 'Draft': return 'bg-gray-200 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
             {/* Hidden Print Area */}
            {plaqueToPrint && (
                 <div id="print-area">
                    <style jsx global>{`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #print-area, #print-area * {
                                visibility: visible;
                            }
                            #print-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                height: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background: white;
                                z-index: 9999;
                            }
                        }
                    `}</style>
                    <div className="w-full h-full flex justify-center items-center">
                        <PlaquePreview
                            actionText={plaqueToPrint.actionText || "SCAN HERE"}
                            description={plaqueToPrint.description || "FOR PAYMENT"}
                            extraInfo={plaqueToPrint.extraInfo || ""}
                            qrCodeUrl={plaqueToPrint.qrCodeUrl || ""}
                        />
                    </div>
                 </div>
            )}

            <div className="space-y-6">
                 {/* Header with Actions & Counter */}
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">QR Plaques</h2>
                    <div className="flex items-center gap-2">
                        {/* Counter */}
                        <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                            {isSubscriptionLoading ? (
                                <span>Loading...</span>
                            ) : (
                                <span className={isLimitReached ? "text-red-600 font-bold" : ""}>
                                    Used: {currentCount} / {maxPlaques === -1 ? 'Unlimited' : maxPlaques}
                                </span>
                            )}
                        </div>

                         <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download All
                        </Button>

                        {/* Create Button with Limit Enforcement */}
                        {isLimitReached ? (
                            <Button disabled title={`Plaque limit reached (${maxPlaques}). Upgrade your plan to create more.`}>
                                <Plus className="mr-2 h-4 w-4" /> Create QR Plaque
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href="/dashboard/my-assets/qr-plaques/create">
                                    <Plus className="mr-2 h-4 w-4" /> Create QR Plaque
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <Select>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="for-sale">For Sale</SelectItem>
                            <SelectItem value="pending">Pending Assignment</SelectItem>
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange date={date} setDate={setDate} />
                </div>

                {/* Plaques Table */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <table className="w-full">
                        <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                            <tr>
                                <th className="p-4">Plaque ID</th>
                                <th className="p-4">Partner / Price</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Linked Offer</th>
                                <th className="p-4">Scans</th>
                                <th className="p-4">Redemptions</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plaques.map((plaque) => (
                                <tr
                                    key={plaque.id}
                                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleViewDetails(plaque)}
                                >
                                    <td className="p-4 font-medium">{plaque.id}</td>
                                    <td className="p-4">{plaque.status === 'For Sale' ? plaque.price : plaque.partner}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(plaque.status)}`}>{plaque.status}</span></td>
                                    <td className="p-4">{plaque.linkedOffer || 'N/A'}</td>
                                    <td className="p-4">{plaque.scans}</td>
                                    <td className="p-4">{plaque.redemptions}</td>
                                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDetails(plaque)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePrint(plaque)}>
                                                    <Printer className="mr-2 h-4 w-4" /> Print / PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setConfigureModalOpen)}><Settings className="mr-2 h-4 w-4" /> Configure</DropdownMenuItem>
                                                <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download Artwork</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setAssignModalOpen)}><LinkIcon className="mr-2 h-4 w-4" /> Assign to Partner</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setSaleModalOpen)}><Pencil className="mr-2 h-4 w-4" /> Mark for Sale</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setDeactivateModalOpen)}><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Metrics Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Scans & Redemptions</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="scans" fill="#fb923c" /><Bar dataKey="redemptions" fill="#ea580c" /></BarChart></ResponsiveContainer>
                </div>
            </div>

            {/* Modals */}
            <PlaqueDetailsModal
                isOpen={!!viewPlaque}
                onClose={() => setViewPlaque(null)}
                plaque={viewPlaque}
                onPrint={handlePrint}
            />
            <AssignPartnerModal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} onAssign={handleAssign} plaqueId={selectedPlaque?.id || null} />
            <MarkForSaleModal isOpen={isSaleModalOpen} onClose={() => setSaleModalOpen(false)} onConfirm={handleMarkForSale} plaqueId={selectedPlaque?.id || null} />
            <ConfigurePlaqueModal isOpen={isConfigureModalOpen} onClose={() => setConfigureModalOpen(false)} onSave={handleConfigure} plaque={selectedPlaque} />
            <DeactivateConfirmationModal isOpen={isDeactivateModalOpen} onClose={() => setDeactivateModalOpen(false)} onConfirm={handleDeactivate} plaqueId={selectedPlaque?.id || null} />
        </>
    );
};
