'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Award as AwardIcon, Crown, User, Loader2, Settings } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditTierBadgeModal } from '@/components/admin/tier-badge-control/AddEditTierBadgeModal';
import { ManualOverrideModal } from '@/components/admin/tier-badge-control/ManualOverrideModal';
import { TierProgressionModal } from '@/components/admin/tier-badge-control/TierProgressionModal';
import {
  useGetCustomerBadges,
  useDeleteCustomerBadge,
  useCreateCustomerBadge,
  useUpdateCustomerBadge,
  useOverrideBusinessTier,
  useOverrideCustomerBadge
} from '@/services/progression/hook';
import { CustomerBadge, CreateCustomerBadgePayload } from '@/services/progression/types';
import { useGetTiers, useUpdateTierProgression } from '@/services/payment/hook';
import { Tier, UpdateTierProgressionDto } from '@/services/payment/types';

export default function TierBadgeControlPage() {
  // Queries
  const { data: tiers, isLoading: isLoadingTiers, error: tiersError } = useGetTiers();
  const { data: consumerBadges, isLoading: isLoadingBadges, error: badgesError } = useGetCustomerBadges();

  // Mutations
  const { mutate: deleteBadge } = useDeleteCustomerBadge();
  const { mutate: createBadge } = useCreateCustomerBadge();
  const { mutate: updateBadge } = useUpdateCustomerBadge();
  const { mutate: overrideTier } = useOverrideBusinessTier();
  const { mutate: overrideBadge } = useOverrideCustomerBadge();
  const { mutate: updateTierProgression, isPending: isUpdatingProgression } = useUpdateTierProgression();

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

  // State for Add/Edit Modal (Badges only now)
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [addEditModalType, setAddEditModalType] = useState<'tier' | 'badge'>('badge');
  const [currentEditData, setCurrentEditData] = useState<CustomerBadge | undefined>(undefined);

  // State for Tier Progression Modal
  const [showProgressionModal, setShowProgressionModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  // State for Manual Override Modal
  const [showManualOverrideModal, setShowManualOverrideModal] = useState(false);

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
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

  const handleOpenProgressionModal = (tier: Tier) => {
    setSelectedTier(tier);
    setShowProgressionModal(true);
  };

  const handleSaveProgression = (data: UpdateTierProgressionDto) => {
    if (selectedTier) {
      updateTierProgression({ id: selectedTier.id, payload: data }, {
        onSuccess: () => {
          handleShowFeedback("Progression Updated", `Progression for tier "${selectedTier.name}" has been updated.`);
          setShowProgressionModal(false);
        },
        onError: () => handleShowFeedback("Error", "Failed to update tier progression.")
      });
    }
  };

  const handleManualOverride = (userId: string, newLevelId: string, type: 'tier' | 'badge') => {
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
          <TabsTrigger value="business-tiers">Subscription Tiers</TabsTrigger>
          <TabsTrigger value="consumer-badges">Consumer Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="business-tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Subscription Tiers Management</h2>
            {/* Add New Tier button removed as it's usually handled in Financials/Plans, but could be added if needed */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers?.map((tier) => {
              const getTierStyle = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('bronze')) return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-orange-100';
                if (n.includes('silver')) return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-slate-100';
                if (n.includes('gold')) return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-yellow-100';
                if (n.includes('platinum')) return 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-cyan-100';
                if (n.includes('diamond')) return 'bg-gradient-to-br from-blue-50 to-purple-100 border-purple-200 hover:shadow-purple-100';
                return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
              };

              const getIconColor = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('bronze')) return 'text-orange-600';
                if (n.includes('silver')) return 'text-slate-600';
                if (n.includes('gold')) return 'text-yellow-600';
                if (n.includes('platinum')) return 'text-cyan-600';
                if (n.includes('diamond')) return 'text-purple-600';
                return 'text-gray-600';
              };

              return (
                <Card key={tier.id} className={`shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${getTierStyle(tier.name)}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm ${getIconColor(tier.name)}`}>
                        <AwardIcon className="h-6 w-6" />
                      </div>
                      {tier.name}
                    </CardTitle>
                    <Button variant="secondary" size="sm" className="bg-white/80 hover:bg-white shadow-sm" onClick={() => handleOpenProgressionModal(tier)}>
                      <Settings className="mr-2 h-4 w-4" /> Progression
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm mt-2">
                    <p className="text-muted-foreground font-medium">{tier.description}</p>
                    <div className="bg-white/40 p-3 rounded-lg backdrop-blur-sm">
                      <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider opacity-70">Pricing</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">£{tier.monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                        <span className="text-muted-foreground">£{tier.annualPrice}<span className="text-xs">/yr</span></span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider opacity-70">Key Features</h4>
                      <ul className="space-y-1">
                        {tier.features?.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${getIconColor(tier.name).replace('text-', 'bg-')}`} />
                            {f}
                          </li>
                        ))}
                        {tier.features?.length > 3 && <li className="text-xs text-muted-foreground pl-3.5">+{tier.features.length - 3} more features</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                    <Crown className="h-5 w-5" /> {badge.name}
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
                      <li>Points: {badge.minPoints} - {badge.maxPoints ? badge.maxPoints : '∞'}</li>
                      <li>Campaigns Joined: {badge.minCampaignsJoined} - {badge.maxCampaignsJoined ? badge.maxCampaignsJoined : '∞'}</li>
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
          handleSaveBadge(data as CreateCustomerBadgePayload);
        }}
      />

      {selectedTier && (
        <TierProgressionModal
          isOpen={showProgressionModal}
          onClose={() => setShowProgressionModal(false)}
          tier={selectedTier}
          onSave={handleSaveProgression}
          isLoading={isUpdatingProgression}
        />
      )}

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