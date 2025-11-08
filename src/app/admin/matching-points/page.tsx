'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { mockMatchingPointsSettings, MatchingPointsSettings } from '@/lib/mock-data/matching-points';
import { initialSectors } from '@/lib/mock-data/sectors';
import { mockCampaigns } from '@/lib/mock-data/campaigns';
import { AdjustMatchingPointsModal } from '@/components/admin/matching-points/AdjustMatchingPointsModal';
// import { useToast } from '@/components/ui/use-toast'; // Remove toast import
import { FeedbackDialog } from '@/components/ui/feedback-dialog'; // New import

export default function MatchingPointsSettingsPage() {
  const [settings, setSettings] = useState<MatchingPointsSettings>(mockMatchingPointsSettings);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  // const { toast } = useToast(); // Remove toast initialization

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState({
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

    currentSettings.sectorSpecificRanges.forEach((range) => {
      // Find the corresponding sector name
      const sector = initialSectors.find(s => s.id === range.sectorId);
      const sectorName = sector ? sector.name : range.sectorId;

      if (range.minPoints < 0 || !Number.isInteger(range.minPoints)) {
        errors.push(`Min Points for sector ${sectorName} must be a non-negative integer.`);
      }
      if (range.maxPoints < 0 || !Number.isInteger(range.maxPoints)) {
        errors.push(`Max Points for sector ${sectorName} must be a non-negative integer.`);
      }
      if (range.minPoints > range.maxPoints) {
        errors.push(`Min Points for sector ${sectorName} cannot be greater than Max Points.`);
      }
    });

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
    // In a real application, this would be an API call
    handleShowFeedback("Settings Saved!", "Matching points settings have been updated.");
  };

  const handleAdjustMatchingPoints = (userId: string, amount: number, reason: string) => {
    console.log(`Manually adjusting matching points for user ${userId}: Amount=${amount}, Reason=${reason}`);
    // In a real application, this would be an API call to adjust points for the specified user
    handleShowFeedback("Points Adjusted!", `Matching points for ${userId} adjusted by ${amount}.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matching Points Control Panel</h1>
        <p className="text-muted-foreground">Manage global matching point settings and apply logic across campaigns.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Label htmlFor="baseRatio">Base Matching Point Ratio (e.g., 1 for 1:1, 0.5 for 1:0.5)</Label>
            <Input
              id="baseRatio"
              type="number"
              step="0.1"
              value={settings.baseRatio}
              onChange={(e) => setSettings({ ...settings, baseRatio: parseFloat(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Label htmlFor="defaultMinPoints">Default Minimum Points</Label>
            <Input
              id="defaultMinPoints"
              type="number"
              value={settings.defaultMinPoints}
              onChange={(e) => setSettings({ ...settings, defaultMinPoints: parseInt(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Label htmlFor="defaultMaxPoints">Default Maximum Points</Label>
            <Input
              id="defaultMaxPoints"
              type="number"
              value={settings.defaultMaxPoints}
              onChange={(e) => setSettings({ ...settings, defaultMaxPoints: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sector-Specific Ranges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialSectors.map((sector) => {
            const range = settings.sectorSpecificRanges.find(r => r.sectorId === sector.id);
            const minPoints = range ? range.minPoints : settings.defaultMinPoints;
            const maxPoints = range ? range.maxPoints : settings.defaultMaxPoints;

            const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newMin = parseInt(e.target.value);
              setSettings(prevSettings => {
                const existingRangeIndex = prevSettings.sectorSpecificRanges.findIndex(r => r.sectorId === sector.id);
                if (existingRangeIndex > -1) {
                  const newRanges = [...prevSettings.sectorSpecificRanges];
                  newRanges[existingRangeIndex] = { ...newRanges[existingRangeIndex], minPoints: newMin };
                  return { ...prevSettings, sectorSpecificRanges: newRanges };
                } else {
                  return {
                    ...prevSettings,
                    sectorSpecificRanges: [
                      ...prevSettings.sectorSpecificRanges,
                      { sectorId: sector.id, minPoints: newMin, maxPoints: maxPoints }
                    ]
                  };
                }
              });
            };

            const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newMax = parseInt(e.target.value);
              setSettings(prevSettings => {
                const existingRangeIndex = prevSettings.sectorSpecificRanges.findIndex(r => r.sectorId === sector.id);
                if (existingRangeIndex > -1) {
                  const newRanges = [...prevSettings.sectorSpecificRanges];
                  newRanges[existingRangeIndex] = { ...newRanges[existingRangeIndex], maxPoints: newMax };
                  return { ...prevSettings, sectorSpecificRanges: newRanges };
                } else {
                  return {
                    ...prevSettings,
                    sectorSpecificRanges: [
                      ...prevSettings.sectorSpecificRanges,
                      { sectorId: sector.id, minPoints: minPoints, maxPoints: newMax }
                    ]
                  };
                }
              });
            };

            return (
              <div key={sector.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4 last:border-b-0">
                <Label className="col-span-1 font-medium">{sector.name}</Label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`min-${sector.id}`}>Min Points</Label>
                    <Input
                      id={`min-${sector.id}`}
                      type="number"
                      value={minPoints}
                      onChange={handleMinChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`max-${sector.id}`}>Max Points</Label>
                    <Input
                      id={`max-${sector.id}`}
                      type="number"
                      value={maxPoints}
                      onChange={handleMaxChange}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign-Specific Matching Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockCampaigns.map((campaign) => {
            const campaignSetting = settings.campaignSpecificEnabled.find(cs => cs.campaignId === campaign.id);
            const isEnabled = campaignSetting ? campaignSetting.enabled : false;

            const handleToggleChange = (checked: boolean) => {
              setSettings(prevSettings => {
                const existingCampaignIndex = prevSettings.campaignSpecificEnabled.findIndex(cs => cs.campaignId === campaign.id);
                if (existingCampaignIndex > -1) {
                  const newCampaigns = [...prevSettings.campaignSpecificEnabled];
                  newCampaigns[existingCampaignIndex] = { ...newCampaigns[existingCampaignIndex], enabled: checked };
                  return { ...prevSettings, campaignSpecificEnabled: newCampaigns };
                } else {
                  return {
                    ...prevSettings,
                    campaignSpecificEnabled: [
                      ...prevSettings.campaignSpecificEnabled,
                      { campaignId: campaign.id, enabled: checked }
                    ]
                  };
                }
              });
            };

            return (
              <div key={campaign.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <Label>{campaign.title}</Label>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggleChange}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring & Manual Adjustment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Total Matching Points Distributed:</Label>
            <span className="font-bold text-lg">123,456</span> {/* Mock value */}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Manually Adjust Points for Account</h3>
            <p className="text-muted-foreground text-sm">This section will allow manual adjustment of matching points for any user account.</p>
            <Button variant="outline" className="mt-2" onClick={() => setShowAdjustModal(true)}>Open Manual Adjustment Tool</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save All Settings</Button>
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
