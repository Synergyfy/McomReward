'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deal } from '@/services/deals/types';
import {
    MoreHorizontal,
    Calendar,
    Tag,
    Eye,
    Edit2,
    Trash2,
    Power,
    PowerOff,
    TrendingUp,
    MapPin,
    Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DealItemProps {
    deal: Deal;
    onDeactivate?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export default function DealItem({ deal, onDeactivate, onDelete }: DealItemProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'declined':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'flagged':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const isExpired = new Date(deal.endDate) < new Date();

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Image Section */}
                <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    {deal.imageUrl ? (
                        <Image
                            src={deal.imageUrl}
                            alt={deal.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Tag size={32} />
                        </div>
                    )}
                    {deal.isFeatured && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 backdrop-blur text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                            Featured
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={cn("px-2 py-0 text-[10px] uppercase font-bold border", getStatusColor(deal.status))}>
                                    {deal.status}
                                </Badge>
                                {isExpired && (
                                    <Badge variant="destructive" className="px-2 py-0 text-[10px] uppercase font-bold">
                                        Expired
                                    </Badge>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Tag size={12} />
                                    {deal.type}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                                {deal.title}
                            </h3>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-gray-100">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-100">
                                <DropdownMenuLabel>Deal Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-md">
                                    <Link href={`/dashboard/deals/edit/${deal.id}`} className="flex items-center gap-2">
                                        <Edit2 size={16} /> Edit Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-md">
                                    <Link href={`/dashboard/deals/stats/${deal.id}`} className="flex items-center gap-2">
                                        <TrendingUp size={16} /> View Performance
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDeactivate?.(deal.id)}
                                    className={cn("rounded-md", deal.isActive ? "text-amber-600" : "text-emerald-600")}
                                >
                                    {deal.isActive ? (
                                        <><PowerOff size={16} className="mr-2" /> Deactivate Deal</>
                                    ) : (
                                        <><Power size={16} className="mr-2" /> Activate Deal</>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete?.(deal.id)}
                                    className="rounded-md text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                >
                                    <Trash2 size={16} className="mr-2" /> Delete Permanently
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {deal.description}
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Value</p>
                            <p className="font-bold text-primary">£{parseFloat(deal.value.toString()).toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Usage</p>
                            <p className="text-sm font-semibold">{deal.soldQuantity} <span className="text-xs font-normal text-muted-foreground">claimed</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">End Date</p>
                            <p className="text-xs font-semibold flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                {format(new Date(deal.endDate), 'MMM dd, yyyy')}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Location</p>
                            <p className="text-xs font-semibold truncate flex items-center gap-1">
                                <MapPin size={12} className="text-gray-400" />
                                {deal.location || 'Global'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
