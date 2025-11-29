'use client';

import React, { useState } from 'react';
import { Download, Link as LinkIcon, Pencil, Trash2, MoreVertical, Settings, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useParams } from 'next/navigation'; // Import useParams
import { useGetQrPlaquesData } from '@/services/qr-plaques/hook'; // Import the new hook
import { QrPlaque } from '@/services/qr-plaques/types'; // Import QrPlaque type

// Import Modals (these will be effectively disabled in impersonation mode)
import AssignPartnerModal from '@/components/dashboard/my-assets/qr-plaques/AssignPartnerModal';
import MarkForSaleModal from '@/components/dashboard/my-assets/qr-plaques/MarkForSaleModal';
import ConfigurePlaqueModal from '@/components/dashboard/my-assets/qr-plaques/ConfigurePlaqueModal';
import DeactivateConfirmationModal from '@/components/dashboard/my-assets/qr-plaques/DeactivateConfirmationModal';


export default function QRPlaquesPage() {
    const params = useParams();
    const businessId = params.businessId as string;

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'for-sale' | 'pending'>('all');

    const { data: qrPlaquesData, isLoading, isError } = useGetQrPlaquesData({
        businessId,
        status: statusFilter,
        dateRange: dateRange,
    });

    const plaques: QrPlaque[] = qrPlaquesData?.plaques || [];
    const chartData = qrPlaquesData?.chartData || [];

    // All modals and actions should be effectively disabled in impersonation view
    const isImpersonating = true; // Hardcode to true for this context, or derive from admin state
    const [selectedPlaque, setSelectedPlaque] = useState<QrPlaque | null>(null);

    // Modal states (always closed in impersonation view, or just triggers disabled)
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isSaleModalOpen, setSaleModalOpen] = useState(false);
    const [isConfigureModalOpen, setConfigureModalOpen] = useState(false);
    const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);

    // Handlers (no-op in impersonation mode)
    const handleOpenModal = (plaque: QrPlaque, modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
        if (!isImpersonating) {
            setSelectedPlaque(plaque);
            modalSetter(true);
        }
    };

    const handleAssign = () => {}; // No-op
    const handleMarkForSale = () => {}; // No-op
    const handleConfigure = () => {}; // No-op
    const handleDeactivate = () => {}; // No-op

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            case 'For Sale': return 'bg-yellow-100 text-yellow-800';
            case 'Pending Assignment': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isError || !qrPlaquesData) {
        return <div className="text-center text-red-500 py-10">Error loading QR plaques data.</div>;
    }

    return (
        <>
            <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isImpersonating}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="for-sale">For Sale</SelectItem>
                            <SelectItem value="pending">Pending Assignment</SelectItem>
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} disabled={isImpersonating} />
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
                                <tr key={plaque.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{plaque.id}</td>
                                    <td className="p-4">{plaque.status === 'For Sale' ? plaque.price : plaque.partner}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(plaque.status)}`}>{plaque.status}</span></td>
                                    <td className="p-4">{plaque.linkedOffer || 'N/A'}</td>
                                    <td className="p-4">{plaque.scans}</td>
                                    <td className="p-4">{plaque.redemptions}</td>
                                    <td className="p-4 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isImpersonating}> {/* Disable dropdown trigger */}
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setConfigureModalOpen)} disabled={isImpersonating}><Settings className="mr-2 h-4 w-4" /> Configure</DropdownMenuItem>
                                                <DropdownMenuItem disabled={isImpersonating}><Download className="mr-2 h-4 w-4" /> Download Artwork</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setAssignModalOpen)} disabled={isImpersonating}><LinkIcon className="mr-2 h-4 w-4" /> Assign to Partner</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setSaleModalOpen)} disabled={isImpersonating}><Pencil className="mr-2 h-4 w-4" /> Mark for Sale</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenModal(plaque, setDeactivateModalOpen)} disabled={isImpersonating}><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
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

            {/* Modals (will not open in impersonation mode) */}
            <AssignPartnerModal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} onAssign={handleAssign} plaqueId={selectedPlaque?.id || null} />
            <MarkForSaleModal isOpen={isSaleModalOpen} onClose={() => setSaleModalOpen(false)} onConfirm={handleMarkForSale} plaqueId={selectedPlaque?.id || null} />
            <ConfigurePlaqueModal isOpen={isConfigureModalOpen} onClose={() => setConfigureModalOpen(false)} onSave={handleConfigure} plaque={selectedPlaque} />
            <DeactivateConfirmationModal isOpen={isDeactivateModalOpen} onClose={() => setDeactivateModalOpen(false)} onConfirm={handleDeactivate} plaqueId={selectedPlaque?.id || null} />
        </>
    );
};
