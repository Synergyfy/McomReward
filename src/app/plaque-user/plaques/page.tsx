'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QrCode, MoreHorizontal, Search, Filter, Download, Share2, MapPin, Eye, Plus, Printer } from 'lucide-react';
import { plaqueList as initialPlaqueList } from '@/lib/mock-data/plaque-dashboard';
import Link from 'next/link';
import { useGetMySubscription } from '@/services/tiers/hook';
import { PlaquePreview } from '@/components/plaque/PlaquePreview';

// Define the type for our plaque items
interface Plaque {
    id: string;
    name: string;
    status: string;
    scans30d: number;
    location: string;
    // Optional fields for saved templates
    actionText?: string;
    description?: string;
    extraInfo?: string;
    qrCodeUrl?: string;
}

export default function MyPlaquesPage() {
    const [plaques, setPlaques] = useState<Plaque[]>(initialPlaqueList);
    const { data: subscription, isLoading: isSubscriptionLoading } = useGetMySubscription();

    // State for printing
    const [plaqueToPrint, setPlaqueToPrint] = useState<Plaque | null>(null);

    useEffect(() => {
        // Load saved plaques from local storage
        try {
            const saved = JSON.parse(localStorage.getItem('my_plaques_list') || '[]');
            if (saved.length > 0) {
                // Determine if we should append or if they are already there (simple check)
                setPlaques([...initialPlaqueList, ...saved]);
            }
        } catch (e) {
            console.error("Failed to load saved plaques", e);
        }
    }, []);

    const maxPlaques = subscription?.tier?.qrCodeCount || 0;
    const currentCount = plaques.length;

    // Effect to trigger print when plaqueToPrint is set
    useEffect(() => {
        if (plaqueToPrint) {
            // Give a small delay for state to update and DOM to render the preview
            const timer = setTimeout(() => {
                window.print();
                // Reset after print dialog closes (or timeout)
                // Note: window.print is blocking in many browsers, so this runs after
                setPlaqueToPrint(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [plaqueToPrint]);

    const handlePrint = (plaque: Plaque) => {
        setPlaqueToPrint(plaque);
    };

    return (
        <div className="space-y-6">
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Plaques</h1>
                    <p className="text-muted-foreground">Manage and track your assigned plaques.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Counter */}
                    <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                        {isSubscriptionLoading ? (
                            <span>Loading limits...</span>
                        ) : (
                            <span>
                                Used: {currentCount} / {maxPlaques === -1 ? 'Unlimited' : maxPlaques}
                            </span>
                        )}
                    </div>

                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download All
                    </Button>
                    <Button asChild>
                        <Link href="/plaque-user/plaques/create">
                            <Plus className="mr-2 h-4 w-4" /> Create QR Plaque
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search plaques..." className="pl-8" />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Plaque Info</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Scans (30d)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plaques.map((plaque) => (
                            <TableRow key={plaque.id}>
                                <TableCell>
                                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                        {plaque.qrCodeUrl ? (
                                            <img src={plaque.qrCodeUrl} alt="QR" className="w-full h-full object-cover" />
                                        ) : (
                                            <QrCode className="h-5 w-5 text-gray-600" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{plaque.name}</div>
                                    <div className="text-xs text-muted-foreground">{plaque.id}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {plaque.location}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={plaque.status === 'Active' ? 'default' : 'secondary'}>
                                        {plaque.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {plaque.scans30d}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/plaque-user/plaques/${plaque.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePrint(plaque)}>
                                                <Printer className="mr-2 h-4 w-4" /> Print / PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Share2 className="mr-2 h-4 w-4" /> Share Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <MapPin className="mr-2 h-4 w-4" /> Edit Location
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
