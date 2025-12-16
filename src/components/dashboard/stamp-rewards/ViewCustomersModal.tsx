'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Users,
    Search,
    Stamp,
    Gift,
    CheckCircle2,
    Clock,
    User,
    MoreVertical,
    QrCode,
    Award,
    X,
    Filter,
    TrendingUp
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BusinessStampReward, CustomerStampCard } from '@/services/business-stamp-rewards/types';
import { useGetCustomerStampCards, useRedeemStampCard } from '@/services/business-stamp-rewards/hook';

interface ViewCustomersModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: BusinessStampReward | null;
    onAwardStamp?: () => void;
}

// Mock customer data for demonstration
const mockEnrolledCustomers: CustomerStampCard[] = [
    {
        id: 'csc-1',
        customerId: 'customer-1',
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=alice',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 4,
        stampsRequired: 5,
        status: 'in_progress',
        stampHistory: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-2',
        customerId: 'customer-2',
        customerName: 'Bob Smith',
        customerEmail: 'bob@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=bob',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 5,
        stampsRequired: 5,
        status: 'completed',
        stampHistory: [],
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-3',
        customerId: 'customer-3',
        customerName: 'Carol Davis',
        customerEmail: 'carol@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=carol',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 2,
        stampsRequired: 5,
        status: 'in_progress',
        stampHistory: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-4',
        customerId: 'customer-4',
        customerName: 'David Wilson',
        customerEmail: 'david@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=david',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 5,
        stampsRequired: 5,
        status: 'redeemed',
        stampHistory: [],
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-5',
        customerId: 'customer-5',
        customerName: 'Emma Brown',
        customerEmail: 'emma@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=emma',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 1,
        stampsRequired: 5,
        status: 'in_progress',
        stampHistory: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'in_progress':
            return 'bg-blue-500/10 text-blue-600 border-blue-200';
        case 'completed':
            return 'bg-green-500/10 text-green-600 border-green-200';
        case 'redeemed':
            return 'bg-gray-500/10 text-gray-600 border-gray-200';
        default:
            return 'bg-gray-500/10 text-gray-600';
    }
};

const STATUS_LABELS: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Ready',
    redeemed: 'Redeemed',
    expired: 'Expired',
};

export default function ViewCustomersModal({
    isOpen,
    onClose,
    reward,
    onAwardStamp,
}: ViewCustomersModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const { mutate: redeemCard, isPending: isRedeeming } = useRedeemStampCard();

    // Use mock data for demonstration
    const customers = mockEnrolledCustomers;

    // Filter customers - MUST be called before any early returns!
    const filteredCustomers = useMemo(() => {
        let filtered = [...customers];

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(c => c.status === activeTab);
        }

        // Filter by search
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [customers, activeTab, searchTerm]);

    // Stats - compute before any early returns
    const stats = useMemo(() => ({
        total: customers.length,
        inProgress: customers.filter(c => c.status === 'in_progress').length,
        completed: customers.filter(c => c.status === 'completed').length,
        redeemed: customers.filter(c => c.status === 'redeemed').length,
    }), [customers]);

    // Early return AFTER all hooks
    if (!reward) return null;

    const handleRedeem = (cardId: string) => {
        redeemCard({ stampCardId: cardId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogHeader className="p-0">
                                    <DialogTitle className="text-xl">Enrolled Customers</DialogTitle>
                                    <DialogDescription>
                                        {reward.template.title}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>
                        <Button
                            onClick={onAwardStamp}
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                            <QrCode className="h-4 w-4" />
                            Award Stamp
                        </Button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-lg font-bold text-green-600">{stats.completed}</p>
                        <p className="text-xs text-gray-500">Ready</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-lg font-bold text-gray-600">{stats.redeemed}</p>
                        <p className="text-xs text-gray-500">Redeemed</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="h-9">
                            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                            <TabsTrigger value="in_progress" className="text-xs px-3">In Progress</TabsTrigger>
                            <TabsTrigger value="completed" className="text-xs px-3">Ready</TabsTrigger>
                            <TabsTrigger value="redeemed" className="text-xs px-3">Redeemed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Customer list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No customers found</p>
                            <p className="text-sm">
                                {searchTerm ? 'Try a different search term' : 'No customers have enrolled yet'}
                            </p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <Card key={customer.id} className="hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {customer.customerAvatar ? (
                                                <Image
                                                    src={customer.customerAvatar}
                                                    alt={customer.customerName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Customer info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {customer.customerName}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] ${getStatusStyles(customer.status)}`}
                                                >
                                                    {STATUS_LABELS[customer.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{customer.customerEmail}</p>
                                        </div>

                                        {/* Progress */}
                                        <div className="flex-shrink-0 text-right">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                {Array.from({ length: customer.stampsRequired }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-5 h-5 rounded flex items-center justify-center text-xs ${i < customer.stampsCollected
                                                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                                            }`}
                                                    >
                                                        {i < customer.stampsCollected ? (
                                                            reward.template.stampIcon || '⭐'
                                                        ) : (
                                                            <span className="text-[10px]">{i + 1}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {customer.stampsCollected}/{customer.stampsRequired} stamps
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 z-[9999]">
                                                <DropdownMenuItem onClick={onAwardStamp}>
                                                    <Stamp className="mr-2 h-4 w-4" />
                                                    Award Stamp
                                                </DropdownMenuItem>
                                                {customer.status === 'completed' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleRedeem(customer.id)}
                                                        disabled={isRedeeming}
                                                    >
                                                        <Gift className="mr-2 h-4 w-4" />
                                                        Mark Redeemed
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>
                                                    <TrendingUp className="mr-2 h-4 w-4" />
                                                    View History
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                                        </span>
                                        {customer.completedAt && (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                Completed {new Date(customer.completedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                        {customer.redeemedAt && (
                                            <span className="flex items-center gap-1">
                                                <Gift className="h-3 w-3 text-purple-500" />
                                                Redeemed {new Date(customer.redeemedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
