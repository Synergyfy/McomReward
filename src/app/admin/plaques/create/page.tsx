'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AddEditPlaqueModal } from '@/components/admin/plaques/AddEditPlaqueModal';
import { QrPlaque } from '@/services/qr-plaques/types';
import { useCreateAdminQrPlaque } from '@/services/qr-plaques/hook';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

export default function AdminCreatePlaquePage() {
    const router = useRouter();
    const { mutate: createPlaque, isPending } = useCreateAdminQrPlaque();
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [feedbackData, setFeedbackData] = React.useState({ title: '', description: '', actionText: 'OK' });

    const handleSave = (plaque: any) => { // Using any to accept the raw form data from modal
        // Map fields to match CreateQrPlaqueRequest strict requirements
        createPlaque({
            name: plaque.name,
            description: plaque.description || '',
            actionText: plaque.actionText || 'Scan Here',
            footerText: plaque.footerText || '',
            contentUrl: plaque.contentUrl, // This should now be populated from modal
            status: plaque.status,
            price: plaque.price ?? undefined,
            assignedBusinessId: plaque.assignedBusinessId, // Modal sends undefined if empty
            assignedPartnerId: plaque.assignedPartnerId,
            networkContactId: plaque.networkContactId
        }, {
            onSuccess: () => {
                setFeedbackData({
                    title: 'Success',
                    description: 'Plaque created successfully.',
                    actionText: 'Go to List'
                });
                setShowFeedback(true);
            },
            onError: (error: any) => {
                 setFeedbackData({
                    title: 'Error',
                    description: error.response?.data?.message?.join(', ') || 'Failed to create plaque.',
                    actionText: 'Close'
                });
                setShowFeedback(true);
            }
        });
    };

    const handleFeedbackClose = () => {
        setShowFeedback(false);
        if (feedbackData.title === 'Success') {
             router.push('/admin/plaques/list');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create New Plaque</h1>
            <AddEditPlaqueModal
                isOpen={true}
                onClose={() => router.push('/admin/plaques/list')}
                onSave={handleSave}
                onShowFeedback={(t, d, a) => { setFeedbackData({title: t, description: d as string, actionText: a || 'OK'}); setShowFeedback(true); }}
                isSaving={isPending}
            />

            <FeedbackDialog
                isOpen={showFeedback}
                onClose={handleFeedbackClose}
                title={feedbackData.title}
                description={feedbackData.description}
                actionText={feedbackData.actionText}
            />
        </div>
    );
}
