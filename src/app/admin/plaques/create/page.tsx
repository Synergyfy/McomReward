'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditPlaqueModal } from '@/components/admin/plaques/AddEditPlaqueModal'; // Import the modal
import { Plaque, mockPlaques } from '@/lib/mock-data/plaques'; // Import Plaque interface and mockPlaques

export default function CreatePlaquePage() {
  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{ title: string; description: React.ReactNode; actionText: string }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  // State for Add/Edit Plaque Modal
  const [showAddEditPlaqueModal, setShowAddEditPlaqueModal] = useState(false);

  const handleSavePlaque = (newPlaque: Plaque) => {
    setShowAddEditPlaqueModal(false); // Close modal first
    setTimeout(() => {
      mockPlaques.push(newPlaque); // Add to mock data
      handleShowFeedback("Plaque Created", `Plaque "${newPlaque.name}" has been successfully created.`);
    }, 300);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Plaque</h1>
        <p className="text-muted-foreground">Form where admin can choose a group, select owner, enter plaque details, and generate a QR code.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Plaque</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowAddEditPlaqueModal(true)}><PlusCircle className="mr-2 h-4 w-4" /> Open Create Plaque Form</Button>
          <p className="text-muted-foreground mt-2">Click the button to open the form for creating a new plaque.</p>
        </CardContent>
      </Card>

      <AddEditPlaqueModal
        isOpen={showAddEditPlaqueModal}
        onClose={() => setShowAddEditPlaqueModal(false)}
        onSave={handleSavePlaque}
        onShowFeedback={handleShowFeedback}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}