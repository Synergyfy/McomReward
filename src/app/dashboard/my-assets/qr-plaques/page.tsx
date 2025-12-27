'use client';

import React, { useState, useEffect } from 'react';
import { Download, Link as LinkIcon, Pencil, Trash2, MoreVertical, Settings, Plus, Printer, Eye, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import Link from 'next/link';
import { useGetMySubscription } from '@/services/tiers/hook';
import { PlaquePreview } from '@/components/plaque/PlaquePreview';
import { useGetQrPlaques, useUpdateQrPlaque } from '@/services/qr-plaques/hook';
import { QrPlaque } from '@/services/qr-plaques/types';
import { format } from 'date-fns';
import { RelationshipTag, LocationTag } from '@/services/network-contacts/types';

// Import Modals
import AssignPartnerModal from '@/components/dashboard/my-assets/qr-plaques/AssignPartnerModal';
import MarkForSaleModal from '@/components/dashboard/my-assets/qr-plaques/MarkForSaleModal';
import ConfigurePlaqueModal from '@/components/dashboard/my-assets/qr-plaques/ConfigurePlaqueModal';
import DeactivateConfirmationModal from '@/components/dashboard/my-assets/qr-plaques/DeactivateConfirmationModal';
import PlaqueDetailsModal from '@/components/dashboard/my-assets/qr-plaques/PlaqueDetailsModal';

const chartData = [
    { name: 'Mon', scans: 0, redemptions: 0 },
    { name: 'Tue', scans: 0, redemptions: 0 },
    { name: 'Wed', scans: 0, redemptions: 0 },
    { name: 'Thu', scans: 0, redemptions: 0 },
    { name: 'Fri', scans: 0, redemptions: 0 },
    { name: 'Sat', scans: 0, redemptions: 0 },
    { name: 'Sun', scans: 0, redemptions: 0 },
];

interface PaginatedPlaques {
    data: QrPlaque[];
    meta: {
        total: number;
    };
}

const TIER_LIMITS: Record<string, number> = {
    'Bronze Plan': 5,
    'Silver Plan': 10,
    'Gold Plan': 20,
    'Platinum Plan': 50
};

export default function QRPlaquesPage() {
    const [date, setDate] = useState<DateRange | undefined>({ from: undefined, to: undefined });
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page] = useState(1);
    const limit = 10;

    const [selectedPlaque, setSelectedPlaque] = useState<QrPlaque | null>(null);

    const queryParams = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? [statusFilter] : undefined,
        startDate: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
        endDate: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
        sort: 'NEWEST'
    };

    const { data: plaquesResponse, isLoading } = useGetQrPlaques(queryParams);
    const { mutate: updatePlaque } = useUpdateQrPlaque();

    // FIXED: Removed 'any' and added safe type casting
    const paginatedData = plaquesResponse as unknown as PaginatedPlaques;
    
    const plaques = Array.isArray(plaquesResponse)
        ? plaquesResponse
        : paginatedData?.data || [];

    const totalItems = paginatedData?.meta?.total ?? plaques.length;

    const { data: subscription, isLoading: isSubscriptionLoading } = useGetMySubscription();

    let maxPlaques = 5;
    if (subscription?.tier) {
        if (typeof subscription.tier.qrCodeCount === 'number' && subscription.tier.qrCodeCount > 0) {
            maxPlaques = subscription.tier.qrCodeCount;
        } else if (subscription.tier.name && TIER_LIMITS[subscription.tier.name]) {
            maxPlaques = TIER_LIMITS[subscription.tier.name];
        }
    }

    const currentCount = totalItems;
    const isLimitReached = maxPlaques !== -1 && currentCount >= maxPlaques;

    const [plaqueToPrint, setPlaqueToPrint] = useState<QrPlaque | null>(null);
    const [viewPlaque, setViewPlaque] = useState<QrPlaque | null>(null);

    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isSaleModalOpen, setSaleModalOpen] = useState(false);
    const [isConfigureModalOpen, setConfigureModalOpen] = useState(false);
    const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);

    useEffect(() => {
        if (plaqueToPrint) {
            const timer = setTimeout(() => {
                window.print();
                setPlaqueToPrint(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [plaqueToPrint]);

    const handleOpenModal = (plaque: QrPlaque, modalSetter: (open: boolean) => void) => {
        setSelectedPlaque(plaque);
        modalSetter(true);
    };

    const handleAssign = (partnerDetails: {
        name: string;
        email: string;
        businessName: string;
        relationshipTag: RelationshipTag;
        locationTag: LocationTag;
    }) => {
        if (!selectedPlaque) return;
        updatePlaque({
            id: selectedPlaque.id,
            data: {
                status: 'PENDING',
                assigneeName: partnerDetails.name,
                assigneeEmail: partnerDetails.email,
                assigneeBusinessName: partnerDetails.businessName,
                relationshipTag: partnerDetails.relationshipTag,
                locationTag: partnerDetails.locationTag
            }
        }, {
            onSuccess: () => setAssignModalOpen(false)
        });
    };

    const handleMarkForSale = (price: string) => {
        if (!selectedPlaque) return;
        const priceValue = parseFloat(price.replace(/[^0-9.]/g, ''));
        updatePlaque({
            id: selectedPlaque.id,
            data: { status: 'FOR_SALE', price: priceValue }
        }, {
            onSuccess: () => setSaleModalOpen(false)
        });
    };

    const handleConfigure = (config: { linkedOffer: string }) => {
        if (!selectedPlaque) return;
        updatePlaque({
            id: selectedPlaque.id,
            data: { contentUrl: config.linkedOffer, status: 'ACTIVE' }
        }, {
            onSuccess: () => setConfigureModalOpen(false)
        });
    };

    const handleDeactivate = () => {
        if (!selectedPlaque) return;
        updatePlaque({
            id: selectedPlaque.id,
            data: { status: 'INACTIVE' }
        }, {
            onSuccess: () => setDeactivateModalOpen(false)
        });
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'INACTIVE': return 'bg-red-100 text-red-800';
            case 'FOR_SALE': return 'bg-yellow-100 text-yellow-800';
            case 'PENDING': return 'bg-blue-100 text-blue-800';
            case 'DRAFT': return 'bg-gray-200 text-gray-800';
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
                            body * { visibility: hidden; }
                            #print-area, #print-area * { visibility: visible; }
                            #print-area {
                                position: absolute; left: 0; top: 0;
                                width: 100%; height: 100%;
                                display: flex; justify-content: center; align-items: center;
                                background: white; z-index: 9999;
                            }
                        }
                    `}</style>
                    <div className="w-full h-full flex justify-center items-center">
                        <PlaquePreview
                            title={plaqueToPrint.name}
                            actionText={plaqueToPrint.actionText || "SCAN HERE"}
                            description={plaqueToPrint.description || "FOR PAYMENT"}
                            extraInfo={plaqueToPrint.footerText || ""}
                            qrCodeUrl={plaqueToPrint.qrCodeUrl || ""}
                        />
                    </div>
                 </div>
            )}

            <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">QR Plaques</h2>
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                            {isSubscriptionLoading ? (
                                <span>Loading...</span>
                            ) : (
                                <span className={isLimitReached ? "text-red-600 font-bold" : ""}>
                                    Used: {currentCount} / {maxPlaques === -1 ? 'Unlimited' : maxPlaques}
                                </span>
                            )}
                        </div>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download All</Button>
                        <Button asChild disabled={isLimitReached}>
                            <Link href={isLimitReached ? "#" : "/dashboard/my-assets/qr-plaques/create"}>
                                <Plus className="mr-2 h-4 w-4" /> Create QR Plaque
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search plaques..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="FOR_SALE">For Sale</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange date={date} setDate={setDate} />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading plaques...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                                <tr>
                                    <th className="p-4">Plaque ID</th>
                                    <th className="p-4">Name / Price</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Linked Offer</th>
                                    <th className="p-4">Scans</th>
                                    <th className="p-4">Redemptions</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plaques.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">No plaques found.</td></tr>
                                ) : (
                                    plaques.map((plaque: QrPlaque) => (
                                        <tr key={plaque.id} className="border-b hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setViewPlaque(plaque)}>
                                            <td className="p-4 font-medium">{plaque.id}</td>
                                            <td className="p-4">{plaque.status === 'FOR_SALE' ? plaque.price : plaque.name}</td>
                                            <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(plaque.status)}`}>{plaque.status}</span></td>
                                            <td className="p-4">{plaque.contentUrl || 'N/A'}</td>
                                            <td className="p-4">{plaque.scans || 0}</td>
                                            <td className="p-4">{plaque.redemptions || 0}</td>
                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setViewPlaque(plaque)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setPlaqueToPrint(plaque)}><Printer className="mr-2 h-4 w-4" /> Print / PDF</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenModal(plaque, setConfigureModalOpen)}><Settings className="mr-2 h-4 w-4" /> Configure</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenModal(plaque, setAssignModalOpen)}><LinkIcon className="mr-2 h-4 w-4" /> Assign</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenModal(plaque, setSaleModalOpen)}><Pencil className="mr-2 h-4 w-4" /> Mark for Sale</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenModal(plaque, setDeactivateModalOpen)}><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Scans & Redemptions</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                            <Bar dataKey="scans" fill="#fb923c" /><Bar dataKey="redemptions" fill="#ea580c" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <PlaqueDetailsModal isOpen={!!viewPlaque} onClose={() => setViewPlaque(null)} plaque={viewPlaque} onPrint={setPlaqueToPrint} />
            <AssignPartnerModal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} onAssign={handleAssign} plaqueId={selectedPlaque?.id || null} />
            <MarkForSaleModal isOpen={isSaleModalOpen} onClose={() => setSaleModalOpen(false)} onConfirm={handleMarkForSale} plaqueId={selectedPlaque?.id || null} />
            <ConfigurePlaqueModal isOpen={isConfigureModalOpen} onClose={() => setConfigureModalOpen(false)} onSave={handleConfigure} plaque={selectedPlaque ? { id: selectedPlaque.id, linkedOffer: selectedPlaque.contentUrl || null, partner: selectedPlaque.name } : null} />
            <DeactivateConfirmationModal isOpen={isDeactivateModalOpen} onClose={() => setDeactivateModalOpen(false)} onConfirm={handleDeactivate} plaqueId={selectedPlaque?.id || null} />
        </>
    );
}