'use client';

import React from 'react';
import { PlusCircle, MoreVertical, Power, Replace, Eye, BarChart2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useGetNfcCards } from '@/services/nfc-cards/hook';

export default function NFCCardsPage() {
    const router = useRouter();
    const { data, isLoading, isError } = useGetNfcCards();
    const cards = data?.data ?? [];

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Order Extra Cards
                </Button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                {isLoading ? (
                    <p className="p-4 text-sm text-gray-500">Loading NFC cards…</p>
                ) : isError ? (
                    <p className="p-4 text-sm text-red-600">Could not load NFC cards. Please try again.</p>
                ) : cards.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No NFC cards issued yet. Order your first cards to get started.</p>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
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
                            {cards.map((card) => (
                                <tr key={card.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium whitespace-nowrap">{card.id.slice(0, 8).toUpperCase()}</td>
                                    <td className="p-4">{card.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                            card.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {card.status}
                                        </span>
                                    </td>
                                    <td className="p-4">{card.tapCount}</td>
                                    <td className="p-4">
                                        {card.linkedPage ? <a href={card.linkedPage} className="text-orange-600 hover:underline whitespace-nowrap">View Page</a> : 'N/A'}
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
                )}
            </div>
        </div>
    );
};
