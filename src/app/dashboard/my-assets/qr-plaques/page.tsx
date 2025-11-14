'use client';

import React, { useState } from 'react';
import { Download, Link as LinkIcon, Pencil, Trash2, MoreVertical, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

// Import Modals
import AssignPartnerModal from '@/components/dashboard/my-assets/qr-plaques/AssignPartnerModal';
import MarkForSaleModal from '@/components/dashboard/my-assets/qr-plaques/MarkForSaleModal';
import ConfigurePlaqueModal from '@/components/dashboard/my-assets/qr-plaques/ConfigurePlaqueModal';
import DeactivateConfirmationModal from '@/components/dashboard/my-assets/qr-plaques/DeactivateConfirmationModal';

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

type Plaque = typeof initialQrPlaquesData[0];

export default function QRPlaquesPage() {
    const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
    const [plaques, setPlaques] = useState(initialQrPlaquesData);
    const [selectedPlaque, setSelectedPlaque] = useState<Plaque | null>(null);

    // Modal states
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isSaleModalOpen, setSaleModalOpen] = useState(false);
    const [isConfigureModalOpen, setConfigureModalOpen] = useState(false);
    const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);

    // Handlers
    const handleOpenModal = (plaque: Plaque, modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setSelectedPlaque(plaque);
        modalSetter(true);
    };

    const handleAssign = (partnerDetails: { email: string }) => {
        if (!selectedPlaque) return;
        setPlaques(plaques.map(p => p.id === selectedPlaque.id ? { ...p, status: 'Pending Assignment', partner: `Pending (${partnerDetails.email})` } : p));
        setAssignModalOpen(false);
        // TODO: Show toast notification
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

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            case 'For Sale': return 'bg-yellow-100 text-yellow-800';
            case 'Pending Assignment': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <div className="space-y-6">
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
                                <tr key={plaque.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{plaque.id}</td>
                                    <td className="p-4">{plaque.status === 'For Sale' ? plaque.price : plaque.partner}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(plaque.status)}`}>{plaque.status}</span></td>
                                    <td className="p-4">{plaque.linkedOffer || 'N/A'}</td>
                                    <td className="p-4">{plaque.scans}</td>
                                    <td className="p-4">{plaque.redemptions}</td>
                                    <td className="p-4 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
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
            <AssignPartnerModal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} onAssign={handleAssign} plaqueId={selectedPlaque?.id || null} />
            <MarkForSaleModal isOpen={isSaleModalOpen} onClose={() => setSaleModalOpen(false)} onConfirm={handleMarkForSale} plaqueId={selectedPlaque?.id || null} />
            <ConfigurePlaqueModal isOpen={isConfigureModalOpen} onClose={() => setConfigureModalOpen(false)} onSave={handleConfigure} plaque={selectedPlaque} />
            <DeactivateConfirmationModal isOpen={isDeactivateModalOpen} onClose={() => setDeactivateModalOpen(false)} onConfirm={handleDeactivate} plaqueId={selectedPlaque?.id || null} />
        </>
    );
};
