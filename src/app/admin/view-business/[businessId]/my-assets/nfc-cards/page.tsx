'use client';

import React from 'react';
import { PlusCircle, MoreVertical, Power, Replace, Eye, BarChart2, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter
import { useGetNfcCards } from '@/services/nfc-cards/hook'; // Import the new hook
import { NfcCard } from '@/services/nfc-cards/types'; // Import NfcCard type

export default function NFCCardsPage() {
    const router = useRouter();
    const params = useParams();
    const businessId = params.businessId as string;

    const { data: nfcCardsResponse, isLoading, isError } = useGetNfcCards({ businessId });
    const nfcCardsData: NfcCard[] = nfcCardsResponse?.data || [];

    // All modals and actions should be effectively disabled in impersonation view
    const isImpersonating = true; // Hardcode to true for this context, or derive from admin state

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isError || !nfcCardsResponse) {
        return <div className="text-center text-red-500 py-10">Error loading NFC cards data.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button disabled={isImpersonating}> {/* Disable Order Extra Cards button */}
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
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isImpersonating}> {/* Disable dropdown trigger */}
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem disabled={isImpersonating}><Power className="mr-2 h-4 w-4" /> Activate / Deactivate</DropdownMenuItem>
                                            <DropdownMenuItem disabled={isImpersonating}><Replace className="mr-2 h-4 w-4" /> Request Replacement</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => !isImpersonating && router.push(`/admin/view-business/${businessId}/profile`)} disabled={isImpersonating}><Eye className="mr-2 h-4 w-4" /> View Linked Page</DropdownMenuItem>
                                            <DropdownMenuItem disabled={isImpersonating}><BarChart2 className="mr-2 h-4 w-4" /> Track Scans/Taps</DropdownMenuItem>
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
