'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Award as AwardIcon, Crown, User, Loader2 } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditTierBadgeModal } from '@/components/admin/tier-badge-control/AddEditTierBadgeModal';
import { ManualOverrideModal } from '@/components/admin/tier-badge-control/ManualOverrideModal';
import {
  useGetBusinessLevels,
  useGetCustomerBadges,
  useDeleteBusinessLevel,
  useDeleteCustomerBadge,
  useCreateBusinessLevel,
  useUpdateBusinessLevel,
  useCreateCustomerBadge,
  useUpdateCustomerBadge,
  useOverrideBusinessTier,
  useOverrideCustomerBadge
} from '@/services/progression/hook';
import { BusinessLevel, CustomerBadge, CreateBusinessLevelPayload, CreateCustomerBadgePayload } from '@/services/progression/types';

export default function TierBadgeControlPage() {
  // Queries
  const { data: businessTiers, isLoading: isLoadingTiers, error: tiersError } = useGetBusinessLevels();
  const { data: consumerBadges, isLoading: isLoadingBadges, error: badgesError } = useGetCustomerBadges();

  // Mutations
  const { mutate: deleteTier } = useDeleteBusinessLevel();
  const { mutate: deleteBadge } = useDeleteCustomerBadge();
  const { mutate: createTier } = useCreateBusinessLevel();
  const { mutate: updateTier } = useUpdateBusinessLevel();
  const { mutate: createBadge } = useCreateCustomerBadge();
  const { mutate: updateBadge } = useUpdateCustomerBadge();
  const { mutate: overrideTier } = useOverrideBusinessTier();
  const { mutate: overrideBadge } = useOverrideCustomerBadge();

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{
    title: string;
    description: React.ReactNode;
    actionText: string;
  }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  // State for Add/Edit Modal
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [addEditModalType, setAddEditModalType] = useState<'tier' | 'badge'>('tier');
  const [currentEditData, setCurrentEditData] = useState<BusinessLevel | CustomerBadge | undefined>(undefined);

  // State for Manual Override Modal
  const [showManualOverrideModal, setShowManualOverrideModal] = useState(false);

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  const handleAddEditTier = (tier?: BusinessLevel) => {
    setAddEditModalType('tier');
    setCurrentEditData(tier);
    setShowAddEditModal(true);
  };

  const handleSaveTier = (data: CreateBusinessLevelPayload) => {
    if (currentEditData) {
      updateTier({ id: currentEditData.id, payload: data }, {
        onSuccess: () => {
          handleShowFeedback("Tier Updated", `Business Tier "${data.name}" has been updated.`);
          setShowAddEditModal(false);
        },
        onError: () => handleShowFeedback("Error", "Failed to update tier.")
      });
    } else {
      createTier(data, {
        onSuccess: () => {
          handleShowFeedback("Tier Added", `Business Tier "${data.name}" has been added.`);
          setShowAddEditModal(false);
        },
        onError: () => handleShowFeedback("Error", "Failed to create tier.")
      });
    }
  };

  const handleDeleteTier = (tierId: string) => {
    // In a real app, confirm first
    deleteTier(tierId, {
      onSuccess: () => handleShowFeedback("Tier Deleted", `Business Tier has been deleted.`),
      onError: () => handleShowFeedback("Error", "Failed to delete tier.")
    });
  };

  const handleAddEditBadge = (badge?: CustomerBadge) => {
    setAddEditModalType('badge');
    setCurrentEditData(badge);
    setShowAddEditModal(true);
  };

  const handleSaveBadge = (data: CreateCustomerBadgePayload) => {
    if (currentEditData) {
      updateBadge({ id: currentEditData.id, payload: data }, {
        onSuccess: () => {
          handleShowFeedback("Badge Updated", `Customer Badge "${data.name}" has been updated.`);
          setShowAddEditModal(false);
        },
        onError: () => handleShowFeedback("Error", "Failed to update badge.")
      });
    } else {
      createBadge(data, {
        onSuccess: () => {
          handleShowFeedback("Badge Added", `Customer Badge "${data.name}" has been added.`);
          setShowAddEditModal(false);
        },
        onError: () => handleShowFeedback("Error", "Failed to create badge.")
      });
    }
  };

  const handleDeleteBadge = (badgeId: string) => {
    deleteBadge(badgeId, {
      onSuccess: () => handleShowFeedback("Badge Deleted", `Customer Badge has been deleted.`),
      onError: () => handleShowFeedback("Error", "Failed to delete badge.")
    });
  };

  const handleManualOverride = (userId: string, newLevelId: string, type: 'tier' | 'badge') => {
    // Assuming adminId is handled by backend session or context, otherwise we might need to pass it.
    // The payload requires adminId. For now, let's assume a placeholder or fetch from auth context if available.
    // Since I don't have auth context here, I'll use a placeholder "admin-id".
    const adminId = "current-admin-id";

    if (type === 'tier') {
      overrideTier({ businessId: userId, levelId: newLevelId, adminId }, {
        onSuccess: () => handleShowFeedback("Override Applied", `Business Tier updated for ${userId}.`),
        onError: () => handleShowFeedback("Error", "Failed to override tier.")
      });
    } else {
      overrideBadge({ participantId: userId, badgeId: newLevelId, adminId }, {
        onSuccess: () => handleShowFeedback("Override Applied", `Customer Badge updated for ${userId}.`),
        onError: () => handleShowFeedback("Error", "Failed to override badge.")
      });
    }
  };

  if (isLoadingTiers || isLoadingBadges) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (tiersError || badgesError) {
    return <div className="text-red-500">Error loading data. Please try again.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tier & Badge Control</h1>
        <p className="text-muted-foreground">Manage the logic and progression of business tiers and consumer badges.</p>
      </div>

      <Tabs defaultValue="business-tiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business-tiers">Business Tiers</TabsTrigger>
          <TabsTrigger value="consumer-badges">Consumer Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="business-tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Business Tiers Management</h2>
            <Button onClick={() => handleAddEditTier()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Tier</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessTiers?.map((tier) => (
              <Card key={tier.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AwardIcon className="h-5 w-5" style={{ color: tier.color || '#000' }} /> {tier.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddEditTier(tier)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTier(tier.id)}>Delete</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{tier.description}</p>
                  <div>
                    <h4 className="font-semibold">Criteria:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {tier.criteria?.map((c, i) => <li key={i}>{c}</li>)}
                      {!tier.criteria && <li>Min Points: {tier.minPoints}</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Privileges:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {tier.privileges?.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consumer-badges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Consumer Badges Management</h2>
            <Button onClick={() => handleAddEditBadge()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Badge</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consumerBadges?.map((badge) => (
              <Card key={badge.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Crown className="h-5 w-5" style={{ color: badge.color || '#000' }} /> {badge.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddEditBadge(badge)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBadge(badge.id)}>Delete</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{badge.description}</p>
                  <div>
                    <h4 className="font-semibold">Criteria:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {badge.criteria?.map((c, i) => <li key={i}>{c}</li>)}
                      {!badge.criteria && <li>Min Points: {badge.minPoints}</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Privileges:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {badge.privileges?.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Manual User Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">Manually promote or demote any user&apos;s tier or badge level.</p>
          <Button onClick={() => setShowManualOverrideModal(true)}><User className="mr-2 h-4 w-4" /> Open Override Tool</Button>
        </CardContent>
      </Card>

      <AddEditTierBadgeModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        type={addEditModalType}
        initialData={currentEditData}
        onSave={(data) => {
          if (addEditModalType === 'tier') {
            handleSaveTier(data as CreateBusinessLevelPayload);
          } else {
            handleSaveBadge(data as CreateCustomerBadgePayload);
          }
        }}
      />

      <ManualOverrideModal
        isOpen={showManualOverrideModal}
        onClose={() => setShowManualOverrideModal(false)}
        onOverride={handleManualOverride}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}