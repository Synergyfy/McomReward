'use client';

import React from 'react';
import { PlusCircle, MoreVertical, Power, Replace, Eye, BarChart2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const nfcCardsData = [
    { id: 'NFC-001', type: 'Business', status: 'Active', tapCount: 542, linkedPage: '/profile' },
    { id: 'NFC-002', type: 'Staff', status: 'Active', tapCount: 123, linkedPage: '/staff/john-doe' },
    { id: 'NFC-003', type: 'Premium', status: 'Inactive', tapCount: 0, linkedPage: null },
    { id: 'NFC-004', type: 'Business', status: 'Active', tapCount: 890, linkedPage: '/profile' },
  ];

export default function NFCCardsPage() {
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Order Extra Cards
                </Button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full">
                    <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                        <tr>
                            <th className="p-4">Card ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Tap Count</th>
                            <th className="p-4">Linked Page</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nfcCardsData.map((card) => (
                            <tr key={card.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{card.id}</td>
                                <td className="p-4">{card.type}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        card.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {card.status}
                                    </span>
                                </td>
                                <td className="p-4">{card.tapCount}</td>
                                <td className="p-4">
                                    {card.linkedPage ? <a href={card.linkedPage} className="text-orange-600 hover:underline">View Page</a> : 'N/A'}
                                </td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Power className="mr-2 h-4 w-4" /> Activate / Deactivate</DropdownMenuItem>
                                            <DropdownMenuItem><Replace className="mr-2 h-4 w-4" /> Request Replacement</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}><Eye className="mr-2 h-4 w-4" /> View Linked Page</DropdownMenuItem>
                                            <DropdownMenuItem><BarChart2 className="mr-2 h-4 w-4" /> Track Scans/Taps</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
