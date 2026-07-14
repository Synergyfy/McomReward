'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Stamp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RewardType = 'point' | 'stamp';

interface RewardTypeSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: (selectedTypes: RewardType[]) => void;
}

export default function RewardTypeSelectionDialog({
    isOpen,
    onClose,
    onContinue,
}: RewardTypeSelectionDialogProps) {
    const [selectedTypes, setSelectedTypes] = useState<RewardType[]>([]);

    const toggleType = (type: RewardType) => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    const handleContinue = () => {
        if (selectedTypes.length > 0) {
            onContinue(selectedTypes);
            // Reset selection after continuing
            setTimeout(() => setSelectedTypes([]), 300);
        }
    };

    const handleSelectBoth = () => {
        setSelectedTypes(['point', 'stamp']);
        // Small delay to show the selection before continuing
        setTimeout(() => {
            onContinue(['point', 'stamp']);
            setSelectedTypes([]);
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setSelectedTypes([]);
            }
        }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center">Create New Reward</DialogTitle>
                    <DialogDescription className="text-center">
                        Choose the reward types you want to create (select one or both)
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Point Reward Option */}
                    <button
                        onClick={() => toggleType('point')}
                        className={cn(
                            "relative group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                            selectedTypes.includes('point')
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                        )}
                    >
                        {selectedTypes.includes('point') && (
                            <div className="absolute top-3 right-3 text-blue-500">
                                <CheckCircle2 className="h-5 w-5 fill-blue-100 dark:fill-blue-900" />
                            </div>
                        )}
                        <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            selectedTypes.includes('point')
                                ? "bg-blue-500 text-white"
                                : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 group-hover:bg-blue-200 dark:group-hover:bg-blue-800"
                        )}>
                            <Gift className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Point Reward
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create a reward redeemed with points
                            </p>
                        </div>
                    </button>

                    {/* Stamp Reward Option */}
                    <button
                        onClick={() => toggleType('stamp')}
                        className={cn(
                            "relative group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                            selectedTypes.includes('stamp')
                                ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                                : "border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800"
                        )}
                    >
                        {selectedTypes.includes('stamp') && (
                            <div className="absolute top-3 right-3 text-orange-500">
                                <CheckCircle2 className="h-5 w-5 fill-orange-100 dark:fill-orange-900" />
                            </div>
                        )}
                        <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            selectedTypes.includes('stamp')
                                ? "bg-orange-500 text-white"
                                : "bg-orange-100 dark:bg-orange-900/50 text-orange-600 group-hover:bg-orange-200 dark:group-hover:bg-orange-800"
                        )}>
                            <Stamp className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Stamp Reward
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create a reward that customers redeem with stamps
                            </p>
                        </div>
                    </button>

                    {/* Both Option (Combined from dev and HEAD) */}
                    <button
                        onClick={handleSelectBoth}
                        className={cn(
                            "group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                            selectedTypes.includes('point') && selectedTypes.includes('stamp')
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-xl transition-colors",
                            selectedTypes.includes('point') && selectedTypes.includes('stamp')
                                ? "bg-purple-500 text-white"
                                : "bg-purple-100 dark:bg-purple-900/50 text-purple-600 group-hover:bg-purple-200 dark:group-hover:bg-purple-800"
                        )}>
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Both (Points + Stamps)
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create a hybrid reward that supports both points and stamps
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <Button variant="ghost" onClick={onClose} className="text-gray-500">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleContinue}
                        disabled={selectedTypes.length === 0}
                        className={cn(
                            "min-w-[100px]",
                            selectedTypes.includes('point') && !selectedTypes.includes('stamp') && "bg-blue-600 hover:bg-blue-700",
                            selectedTypes.includes('stamp') && !selectedTypes.includes('point') && "bg-orange-600 hover:bg-orange-700",
                            selectedTypes.includes('point') && selectedTypes.includes('stamp') && "bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                        )}
                    >
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
