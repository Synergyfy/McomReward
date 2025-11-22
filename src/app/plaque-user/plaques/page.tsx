'use client';

import React from 'react';
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
import { QrCode, MoreHorizontal, Search, Filter, Download, Share2, MapPin, Eye } from 'lucide-react';
import { plaqueList } from '@/lib/mock-data/plaque-dashboard';
import Link from 'next/link';

export default function MyPlaquesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Plaques</h1>
                    <p className="text-muted-foreground">Manage and track your assigned plaques.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download All
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
                        {plaqueList.map((plaque) => (
                            <TableRow key={plaque.id}>
                                <TableCell>
                                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                        <QrCode className="h-5 w-5 text-gray-600" />
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
