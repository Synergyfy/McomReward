'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMatchingPointsSettings, MatchingPointsSettings } from '@/lib/mock-data/matching-points';
import { initialSectors } from '@/lib/mock-data/sectors';
import { mockCampaigns } from '@/lib/mock-data/campaigns';
import { AdjustMatchingPointsModal } from '@/components/admin/matching-points/AdjustMatchingPointsModal';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Globe, SlidersHorizontal, Briefcase, Megaphone, BarChart, UserPlus } from 'lucide-react';

export default function MatchingPointsSettingsPage() {
  const [settings, setSettings] = useState<MatchingPointsSettings>(mockMatchingPointsSettings);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState({
    title: '',
    description: '' as React.ReactNode,
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
    handleShowFeedback("Settings Saved!", "Matching points settings have been updated.");
  };

  const handleAdjustMatchingPoints = (userId: string, amount: number, reason: string) => {
    console.log(`Manually adjusting matching points for user ${userId}: Amount=${amount}, Reason=${reason}`);
    handleShowFeedback("Points Adjusted!", `Matching points for ${userId} adjusted by ${amount}.`);
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
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Global Settings</CardTitle>
              <CardDescription>Define the base rules for matching points across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseRatio">Base Matching Point Ratio</Label>
                <Input
                  id="baseRatio"
                  type="number"
                  step="0.1"
                  value={settings.baseRatio}
                  onChange={(e) => setSettings({ ...settings, baseRatio: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">e.g., 1 for 1:1, 0.5 for 1:0.5</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultMinPoints">Default Minimum Points</Label>
                <Input
                  id="defaultMinPoints"
                  type="number"
                  value={settings.defaultMinPoints}
                  onChange={(e) => setSettings({ ...settings, defaultMinPoints: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
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
              <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Monitoring & Manual Adjustment</CardTitle>
              <CardDescription>Oversee point distribution and make manual changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <Label>Total Matching Points Distributed:</Label>
                <span className="font-bold text-2xl">123,456</span> {/* Mock value */}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" /> Manually Adjust Points</h3>
                <p className="text-muted-foreground text-sm">Adjust matching points for any user account.</p>
                <Button variant="outline" className="w-full" onClick={() => setShowAdjustModal(true)}>Open Manual Adjustment Tool</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="sectors">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sectors"><Briefcase className="mr-2 h-4 w-4" />Sector-Specific Ranges</TabsTrigger>
              <TabsTrigger value="campaigns"><Megaphone className="mr-2 h-4 w-4" />Campaign-Specific Toggles</TabsTrigger>
            </TabsList>
            <TabsContent value="sectors">
              <Card>
                <CardHeader>
                  <CardTitle>Sector-Specific Ranges</CardTitle>
                  <CardDescription>Override global point ranges for specific business sectors.</CardDescription>
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
                      <div key={sector.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b pb-4 last:border-b-0">
                        <Label className="col-span-1 font-medium">{sector.name}</Label>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor={`min-${sector.id}`} className="text-xs">Min Points</Label>
                            <Input id={`min-${sector.id}`} type="number" value={minPoints} onChange={handleMinChange} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`max-${sector.id}`} className="text-xs">Max Points</Label>
                            <Input id={`max-${sector.id}`} type="number" value={maxPoints} onChange={handleMaxChange} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign-Specific Matching Points</CardTitle>
                  <CardDescription>Enable or disable matching points for individual campaigns.</CardDescription>
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
                        <Label htmlFor={`switch-${campaign.id}`} className="flex-1 pr-4">{campaign.title}</Label>
                        <Switch
                          id={`switch-${campaign.id}`}
                          checked={isEnabled}
                          onCheckedChange={handleToggleChange}
                        />
                      </div>
                    );
                  })}
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
