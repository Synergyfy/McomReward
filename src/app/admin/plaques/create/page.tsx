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

    const handleSave = (plaque: QrPlaque) => {
        // Map fields to match CreateQrPlaqueRequest strict requirements
        createPlaque({
            name: plaque.name,
            description: plaque.description || '', // Fallback for optional fields
            actionText: plaque.actionText || 'Scan Here',
            footerText: plaque.footerText || '',
            contentUrl: plaque.contentUrl || '',
            status: plaque.status,
            price: plaque.price ?? undefined,
            assignedBusinessId: plaque.assignedBusinessId,
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
            }
        });
    };

    const handleFeedbackClose = () => {
        setShowFeedback(false);
        router.push('/admin/plaques/list');
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create New Plaque</h1>
            <AddEditPlaqueModal
                isOpen={true}
                onClose={() => router.push('/admin/plaques/list')}
                onSave={handleSave}
                onShowFeedback={(t, d, a) => { setFeedbackData({title: t, description: d as string, actionText: a || 'OK'}); setShowFeedback(true); }}
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
