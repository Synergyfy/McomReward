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
        // The modal handles the mutation via the hook passed to it, or we handle it here?
        // The modal currently has useUpdateAdminQrPlaque inside it.
        // We should probably refactor the modal to accept a generic onSave or have a mode.
        // For now, let's assume the page handles the "Create" logic if the modal passes back data,
        // BUT the modal as currently written (my previous step) calls updatePlaque internally.

        // Refactoring plan: Update AddEditPlaqueModal to handle both Create and Edit,
        // or accept an onSave that overrides internal logic.
        // Let's pass onSave to the modal, and the modal should use it.

        createPlaque(plaque, { // plaque here is the data object
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
            {/* We can reuse the modal UI or embed it.
                Since the design uses a Modal, we can just render the Modal component
                but forcefully open, or wrap it in a page layout.
                However, usually 'create' pages are full pages.
                But to save time and consistency, I'll invoke the modal immediately or
                better, just render the form content if I extracted it.

                For now, I'll render the Modal component with isOpen=true and redirect on close.
            */}
            <AddEditPlaqueModal
                isOpen={true}
                onClose={() => router.push('/admin/plaques/list')}
                onSave={handleSave} // This needs to be wired correctly in the modal
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
