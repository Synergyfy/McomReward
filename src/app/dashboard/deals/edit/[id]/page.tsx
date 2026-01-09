'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import DealForm from '@/components/dashboard/deals/DealForm';
import { useGetDeal } from '@/services/deals/hook';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditDealPage() {
    const params = useParams();
    const dealId = params.id as string;

    const { data: deal, isLoading, isError, error } = useGetDeal(dealId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-gray-600">Loading deal details...</p>
            </div>
        );
    }

    if (isError || !deal) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Failed to Load Deal</h2>
                <p className="text-gray-600 text-center max-w-md">
                    We couldn't find this deal or there was an error loading its details.
                    Please try again or go back to the deals list.
                </p>
                <Link href="/dashboard/deals">
                    <Button variant="outline">Back to Deals</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Edit Deal</h1>
                <Link href="/dashboard/deals">
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>
            <DealForm deal={deal} dealId={dealId} />
        </div>
    );
}
