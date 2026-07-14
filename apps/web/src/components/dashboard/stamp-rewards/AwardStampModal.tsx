'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    Stamp,
    QrCode,
    User,
    Search,
    Check,
    AlertCircle,
    Sparkles,
    Star
} from 'lucide-react';
import { BusinessStampReward } from '@/services/business-stamp-rewards/types';
import {
    useAwardStamp,
    useGetCustomerStampCards
} from '@/services/business-stamp-rewards/hook';
import LoadingSpinner from '@/components/ui/Loading';

interface AwardStampModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: BusinessStampReward | null;
}

export default function AwardStampModal({
    isOpen,
    onClose,
    reward,
}: AwardStampModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [step, setStep] = useState<'search' | 'confirm' | 'success'>('search');

    const { data: customersData, isLoading: isLoadingCustomers } = useGetCustomerStampCards(reward?.id || '', 1, 50);
    const { mutate: awardStamp, isPending: isAwarding } = useAwardStamp();

    if (!reward) return null;

    const stampsRequired = (reward as any).template?.stampsRequired || (reward as any).stampsRequired || (reward as any).stamps_required || 0;

    const customers = customersData?.data || [];
    const filteredCustomers = customers.filter(c =>
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectCustomer = (customer: any) => {
        setSelectedCustomer({
            id: customer.id,
            name: customer.customerName,
            email: customer.customerEmail,
            avatar: customer.customerAvatar || `https://i.pravatar.cc/150?u=${customer.id}`,
            currentStamps: customer.stampsCollected
        });
        setStep('confirm');
    };

    const handleAwardStamp = () => {
        if (!selectedCustomer) return;

        awardStamp(
            {
                businessStampRewardId: reward.id,
                stampCardId: selectedCustomer.id,
                triggerMethod: (reward as any).template?.triggerMethod || 'manual',
            },
            {
                onSuccess: (data) => {
                    setSelectedCustomer({
                        id: data.id,
                        name: data.customerName,
                        email: data.customerEmail,
                        avatar: data.customerAvatar || `https://i.pravatar.cc/150?u=${data.id}`,
                        currentStamps: data.stampsCollected
                    });
                    setStep('success');
                },
                onError: (error: any) => {
                    console.error('Failed to award stamp', error);
                }
            }
        );
    };

    const handleClose = () => {
        onClose();
        setStep('search');
        setSelectedCustomer(null);
        setSearchTerm('');
    };

    const handleDone = () => {
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                            <QrCode className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Award Stamp</DialogTitle>
                            <DialogDescription>
                                {(reward as any).template?.title || (reward as any).title || 'Reward'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {/* Step: Search / Scan */}
                    {step === 'search' && (
                        <Tabs defaultValue="search" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="search">Search by Name</TabsTrigger>
                                <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
                            </TabsList>

                            <TabsContent value="search" className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Find Customer</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto min-h-[100px] relative">
                                    {isLoadingCustomers ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <LoadingSpinner />
                                            <p className="text-sm text-gray-500 mt-2">Loading customers...</p>
                                        </div>
                                    ) : filteredCustomers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <User className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            <p>No customers found</p>
                                        </div>
                                    ) : (
                                        filteredCustomers.map((customer) => {
                                            const hasCompletedAll = customer.stampsCollected >= stampsRequired;
                                            return (
                                                <Card
                                                    key={customer.id}
                                                    className={`cursor-pointer transition-all hover:shadow-md ${hasCompletedAll ? 'opacity-50' : 'hover:border-orange-300'}`}
                                                    onClick={() => !hasCompletedAll && handleSelectCustomer(customer)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                                                <Image
                                                                    src={customer.customerAvatar || `https://i.pravatar.cc/150?u=${customer.id}`}
                                                                    alt={customer.customerName}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 truncate">{customer.customerName}</p>
                                                                <p className="text-xs text-gray-500 truncate">{customer.customerEmail}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-1">
                                                                    <Stamp className="h-4 w-4 text-orange-500" />
                                                                    <span className="text-sm font-medium">
                                                                        {customer.stampsCollected}/{stampsRequired}
                                                                    </span>
                                                                </div>
                                                                {hasCompletedAll && (
                                                                    <Badge variant="secondary" className="text-[10px] mt-1">
                                                                        Completed
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-600 dark:text-blue-400">
                                    <p className="flex items-center gap-2">
                                        <QrCode className="h-4 w-4" />
                                        Tip: You can also scan the customer&apos;s QR code to quickly find them
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="scan" className="space-y-4">
                                <div className="bg-black rounded-2xl overflow-hidden aspect-square relative border-4 border-white dark:border-gray-800 shadow-xl">
                                    <Scanner
                                        onScan={(result) => {
                                            if (result && result.length > 0) {
                                                const code = result[0].rawValue;
                                                // Trigger award
                                                awardStamp(
                                                    {
                                                        businessStampRewardId: reward.id,
                                                        participantUniqueCode: code,
                                                        triggerMethod: 'qr_scan'
                                                    },
                                                    {
                                                        onSuccess: (data) => {
                                                            setSelectedCustomer({
                                                                id: data.id,
                                                                name: data.customerName,
                                                                email: data.customerEmail,
                                                                avatar: data.customerAvatar || `https://i.pravatar.cc/150?u=${data.id}`,
                                                                currentStamps: data.stampsCollected
                                                            });
                                                            setStep('success');
                                                        },
                                                        onError: (err: any) => {
                                                            alert('Failed to award stamp: ' + err.message);
                                                        }
                                                    }
                                                );
                                            }
                                        }}
                                        styles={{ container: { height: '100%', width: '100%' } }}
                                    />
                                    <div className="absolute inset-0 border-2 border-orange-500/50 m-12 rounded-lg animate-pulse pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs bg-black/50 py-1 mx-4 rounded-full">
                                        Align QR code within frame
                                    </div>
                                </div>
                                <div className="text-center text-sm text-gray-500">
                                    <p>Scanning will automatically award a stamp</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* Step: Confirm */}
                    {step === 'confirm' && selectedCustomer && (
                        <div className="space-y-6 text-center">
                            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
                                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-orange-200">
                                    <Image
                                        src={selectedCustomer.avatar}
                                        alt={selectedCustomer.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {selectedCustomer.name}
                                </h3>
                                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500">Current Progress</span>
                                    <span className="text-sm font-medium">
                                        {selectedCustomer.currentStamps} / {stampsRequired} stamps
                                    </span>
                                </div>

                                {/* Visual stamps */}
                                <div className="flex gap-1.5 justify-center flex-wrap">
                                    {Array.from({ length: stampsRequired }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${i < selectedCustomer.currentStamps
                                                ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/50'
                                                : i === selectedCustomer.currentStamps
                                                    ? 'border-green-500 bg-green-100 dark:bg-green-900/50 animate-pulse scale-110'
                                                    : 'border-dashed border-gray-300 bg-gray-50'
                                                }`}
                                        >
                                            {i < selectedCustomer.currentStamps ? (
                                                <span className="text-sm">{(reward as any).template?.stampIcon || (reward as any).stamp_emoji || (reward as any).stampEmoji || '⭐'}</span>
                                            ) : i === selectedCustomer.currentStamps ? (
                                                <Sparkles className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <span className="text-xs text-gray-400">{i + 1}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                                        <Check className="h-4 w-4" />
                                        After awarding: {selectedCustomer.currentStamps + 1} / {stampsRequired}
                                        {selectedCustomer.currentStamps + 1 >= stampsRequired && (
                                            <span className="ml-1">🎉 Complete!</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Hybrid points info */}
                            {(reward as any).template?.hybridSettings?.enabled && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-700 dark:text-amber-400">
                                    <Star className="h-5 w-5" />
                                    <span className="text-sm">
                                        Customer will also earn <strong>{(reward as any).template?.hybridSettings?.pointsPerStamp} points</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && selectedCustomer && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <Check className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Stamp Awarded! 🎉
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {selectedCustomer.name} now has {selectedCustomer.currentStamps} / {stampsRequired} stamps
                            </p>

                            {selectedCustomer.currentStamps >= stampsRequired && (
                                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl mb-6">
                                    <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                                        🎊 Customer completed all stamps!
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-500">
                                        They can now redeem: {(reward as any).template?.rewardBenefitValue || (reward as any).value || 'their reward'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    {step === 'search' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button disabled className="opacity-50">
                                Select a Customer
                            </Button>
                        </>
                    )}
                    {step === 'confirm' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('search')}>Back</Button>
                            <Button
                                onClick={handleAwardStamp}
                                disabled={isAwarding}
                                className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            >
                                {isAwarding ? (
                                    'Awarding...'
                                ) : (
                                    <>
                                        <Stamp className="h-4 w-4" />
                                        Award Stamp
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                    {step === 'success' && (
                        <>
                            <Button variant="outline" onClick={() => {
                                setStep('search');
                                setSelectedCustomer(null);
                            }}>
                                Award Another
                            </Button>
                            <Button
                                onClick={handleDone}
                                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                                <Check className="h-4 w-4" />
                                Done
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
