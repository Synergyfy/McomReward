'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Stamp, ArrowRight, Sparkles } from 'lucide-react';

interface RewardTypeSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPointReward: () => void;
    onSelectStampReward: () => void;
    onSelectBoth: () => void;
}

export default function RewardTypeSelectionDialog({
    isOpen,
    onClose,
    onSelectPointReward,
    onSelectStampReward,
    onSelectBoth,
}: RewardTypeSelectionDialogProps) {
    const handleSelectPointReward = () => {
        onClose();
        onSelectPointReward();
    };

    const handleSelectStampReward = () => {
        onClose();
        onSelectStampReward();
    };

    const handleSelectBoth = () => {
        onClose();
        onSelectBoth();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">Create New Reward</DialogTitle>
                    <DialogDescription className="text-center">
                        Choose the type of reward you want to create
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Point Reward Option */}
                    <button
                        onClick={handleSelectPointReward}
                        className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                                   hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Gift className="h-6 w-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Point Reward
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create a reward that customers redeem with points
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </button>

                    {/* Stamp Reward Option */}
                    <button
                        onClick={handleSelectStampReward}
                        className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                                   hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                    >
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Stamp className="h-6 w-6 text-orange-600 group-hover:text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Stamp Reward
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create a reward that customers redeem with stamps
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </button>

                    {/* Both Option */}
                    <button
                        onClick={handleSelectBoth}
                        className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                                   hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                    >
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Sparkles className="h-6 w-6 text-purple-600 group-hover:text-white" />
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

                <div className="flex justify-center">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
