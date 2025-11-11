'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Award as AwardIcon, Crown, User } from 'lucide-react';
import { mockBusinessTiers, mockConsumerBadges, BusinessTier, ConsumerBadge } from '@/lib/mock-data/tiers-badges';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { AddEditTierBadgeModal } from '@/components/admin/tier-badge-control/AddEditTierBadgeModal';
import { ManualOverrideModal } from '@/components/admin/tier-badge-control/ManualOverrideModal'; // New import
import { mockBusinessUsers, mockConsumerUsers } from '@/lib/mock-data/users'; // Import mock users for override

interface FeedbackDialogProps {
  title: string;
  description: React.ReactNode;
  actionText?: string;
}

export default function TierBadgeControlPage() {
  const [businessTiers, setBusinessTiers] = useState<BusinessTier[]>(mockBusinessTiers);
  const [consumerBadges, setConsumerBadges] = useState<ConsumerBadge[]>(mockConsumerBadges);

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
  const [currentEditData, setCurrentEditData] = useState<BusinessTier | ConsumerBadge | undefined>(undefined);

  // State for Manual Override Modal
  const [showManualOverrideModal, setShowManualOverrideModal] = useState(false);

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  const handleAddEditTier = (tier?: BusinessTier) => {
    setAddEditModalType('tier');
    setCurrentEditData(tier);
    setShowAddEditModal(true);
  };

  const handleSaveTier = (data: BusinessTier) => {
    if (data.id.startsWith('new-')) {
      setBusinessTiers(prev => [...prev, data]);
      handleShowFeedback("Tier Added", `Business Tier "${data.name}" has been added.`);
    } else {
      setBusinessTiers(prev => prev.map(tier => (tier.id === data.id ? data : tier)));
      handleShowFeedback("Tier Updated", `Business Tier "${data.name}" has been updated.`);
    }
  };

  const handleDeleteTier = (tierId: string) => {
    // In a real app, this would trigger a confirmation dialog first
    setBusinessTiers(prev => prev.filter(tier => tier.id !== tierId));
    handleShowFeedback("Tier Deleted", `Business Tier ${tierId} has been deleted.`);
  };

  const handleAddEditBadge = (badge?: ConsumerBadge) => {
    setAddEditModalType('badge');
    setCurrentEditData(badge);
    setShowAddEditModal(true);
  };

  const handleSaveBadge = (data: ConsumerBadge) => {
    if (data.id.startsWith('new-')) {
      setConsumerBadges(prev => [...prev, data]);
      handleShowFeedback("Badge Added", `Consumer Badge "${data.name}" has been added.`);
    } else {
      setConsumerBadges(prev => prev.map(badge => (badge.id === data.id ? data : badge)));
      handleShowFeedback("Badge Updated", `Consumer Badge "${data.name}" has been updated.`);
    }
  };

  const handleDeleteBadge = (badgeId: string) => {
    // In a real app, this would trigger a confirmation dialog first
    setConsumerBadges(prev => prev.filter(badge => badge.id !== badgeId));
    handleShowFeedback("Badge Deleted", `Consumer Badge ${badgeId} has been deleted.`);
  };

  const handleManualOverride = (userId: string, newLevelId: string, type: 'tier' | 'badge') => {
    console.log(`Manual override for user ${userId}: setting ${type} to ${newLevelId}`);
    // In a real application, this would update the user's actual data in the backend.
    // For mock, we'll just show feedback.
    handleShowFeedback(
      "Override Applied",
      `User ${userId}'s ${type} has been set to ${newLevelId}. (Simulated)`
    );
  };

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
            {businessTiers.map((tier) => (
              <Card key={tier.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AwardIcon className="h-5 w-5" style={{ color: tier.color }} /> {tier.name}
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
                      {tier.criteria.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Privileges:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {tier.privileges.map((p, i) => <li key={i}>{p}</li>)}
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
            {consumerBadges.map((badge) => (
              <Card key={badge.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Crown className="h-5 w-5" style={{ color: badge.color }} /> {badge.name}
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
                      {badge.criteria.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Privileges:</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {badge.privileges.map((p, i) => <li key={i}>{p}</li>)}
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
            handleSaveTier(data as BusinessTier);
          } else {
            handleSaveBadge(data as ConsumerBadge);
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