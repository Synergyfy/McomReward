'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMatchingPointsSettings, MatchingPointsSettings } from '@/lib/mock-data/matching-points';

import { AdjustMatchingPointsModal } from '@/components/admin/matching-points/AdjustMatchingPointsModal';
import { EarningActionsManager } from '@/components/admin/matching-points/EarningActionsManager';
import { ParticipantBadgesManager } from '@/components/admin/matching-points/ParticipantBadgesManager';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Megaphone, UserPlus, Loader2, Zap, Trophy } from 'lucide-react';
import { useAwardMatchingPoints, useToggleMatchingPoints } from '@/services/matching-points/hook';
import { useGetPublicCampaigns } from '@/services/customer-campaigns/hook';

export default function MatchingPointsSettingsPage() {
  const [settings, setSettings] = useState<MatchingPointsSettings>(mockMatchingPointsSettings);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const { mutate: awardPoints } = useAwardMatchingPoints();
  const { mutate: toggleMatchingPoints } = useToggleMatchingPoints();

  // Fetch public campaigns
  const { data: campaignsData, isLoading: isLoadingCampaigns, error: campaignsError } = useGetPublicCampaigns(1, 100);

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

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  const validateSettings = (currentSettings: MatchingPointsSettings) => {
    const errors: string[] = [];

    if (currentSettings.baseRatio <= 0) {
      errors.push('Base Matching Point Ratio must be a positive number.');
    }
    if (currentSettings.defaultMinPoints < 0 || !Number.isInteger(currentSettings.defaultMinPoints)) {
      errors.push('Default Minimum Points must be a non-negative integer.');
    }
    if (currentSettings.defaultMaxPoints < 0 || !Number.isInteger(currentSettings.defaultMaxPoints)) {
      errors.push('Default Maximum Points must be a non-negative integer.');
    }
    if (currentSettings.defaultMinPoints > currentSettings.defaultMaxPoints) {
      errors.push('Default Minimum Points cannot be greater than Default Maximum Points.');
    }



    return errors;
  };

  const handleSaveSettings = () => {
    const errors = validateSettings(settings);
    if (errors.length > 0) {
      handleShowFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    console.log('Saving Matching Points Settings:', settings);
    handleShowFeedback("Settings Saved!", "Matching points settings have been updated.");
  };

  const handleAdjustMatchingPoints = (userId: string, amount: number, reason: string) => {
    awardPoints({
      email: userId,
      points: amount,
      description: reason,
    }, {
      onSuccess: () => {
        handleShowFeedback("Points Adjusted!", `Matching points for ${userId} adjusted by ${amount}.`);
      },
      onError: () => {
        handleShowFeedback("Error", "Failed to adjust matching points.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matching Points Control Panel</h1>
          <p className="text-muted-foreground">Manage global matching point settings and apply logic across campaigns.</p>
        </div>
        <Button onClick={handleSaveSettings} size="lg">Save All Settings</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Manual Adjustment</CardTitle>
              <CardDescription>Manually adjust matching points for any user account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setShowAdjustModal(true)}>Open Manual Adjustment Tool</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="earning-rules">
            <TabsList className="grid w-full grid-cols-3 h-auto"> {/* Changed to 3 columns and auto height for wrapping if needed on small screens */}
              <TabsTrigger value="earning-rules" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700"><Zap className="mr-2 h-4 w-4" />Earning Rules</TabsTrigger>
              <TabsTrigger value="badge-levels" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Trophy className="mr-2 h-4 w-4" />Badge Levels</TabsTrigger>
              <TabsTrigger value="campaigns"><Megaphone className="mr-2 h-4 w-4" />Campaign Toggles</TabsTrigger>
            </TabsList>

            <TabsContent value="earning-rules">
              <EarningActionsManager />
            </TabsContent>

            <TabsContent value="badge-levels">
              <ParticipantBadgesManager />
            </TabsContent>


            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign-Specific Matching Points</CardTitle>
                  <CardDescription>Enable or disable matching points for individual campaigns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingCampaigns ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading campaigns...</span>
                    </div>
                  ) : campaignsError ? (
                    <div className="text-center py-8 text-destructive">
                      Failed to load campaigns. Please try again later.
                    </div>
                  ) : !campaignsData?.data || campaignsData.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No campaigns found.
                    </div>
                  ) : (
                    campaignsData.data.map((campaign) => {
                      const isEnabled = !campaign.matchingPointsDisabledByAdmin;

                      const handleToggleChange = (checked: boolean) => {
                        toggleMatchingPoints(
                          { campaignId: campaign.id },
                          {
                            onSuccess: () => {
                              handleShowFeedback(
                                "Success",
                                `Matching points for "${campaign.name}" have been ${checked ? 'enabled' : 'disabled'}.`
                              );
                            },
                            onError: () => {
                              handleShowFeedback(
                                "Error",
                                `Failed to toggle matching points for "${campaign.name}". Please try again.`
                              );
                            }
                          }
                        );
                      };

                      return (
                        <div key={campaign.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                          <Label htmlFor={`switch-${campaign.id}`} className="flex-1 pr-4">{campaign.name}</Label>
                          <Switch
                            id={`switch-${campaign.id}`}
                            checked={isEnabled}
                            onCheckedChange={handleToggleChange}
                          />
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AdjustMatchingPointsModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onAdjust={handleAdjustMatchingPoints}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}
