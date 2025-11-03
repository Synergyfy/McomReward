'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCampaignForm } from '@/context/CampaignFormContext';
import { Calendar, Users, Gift, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CampaignDetailPagePreview from './previews/CampaignDetailPagePreview';
import EarnPointsPagePreview from './previews/EarnPointsPagePreview';
import RedeemPointsPagePreview from './previews/RedeemPointsPagePreview';
import ContactUsPagePreview from './previews/ContactUsPagePreview';

import FooterPreview from './previews/FooterPreview';

interface StepProps {
  onBack: () => void;
}

// Mock rewards data (should be fetched from API)
const mockRewards = [
  { id: '1', title: 'Summer Voucher ($50)', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Gift Card ($100)', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'Discount Coupon (20% off)', image: 'https://via.placeholder.com/150' },
];

export default function StepReviewAndCreate({ onBack }: StepProps) {
  const router = useRouter();
  const { formData, resetFormData } = useCampaignForm();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('campaignDetail'); // State for managing active preview tab

  const handleCreateCampaign = () => {
    // Here you would typically send the formData to your API
    console.log('Creating campaign with data:', formData);
    setShowSuccessDialog(true);
  };

  const handleDialogAcknowledge = () => {
    setShowSuccessDialog(false);
    resetFormData();
    router.push('/dashboard/campaigns');
  };

  const selectedRewards = mockRewards.filter(r => formData.rewardIds.includes(r.id));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 9: Review and Create Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          {/* New Comprehensive Preview Section */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-xl border border-gray-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Interactive Campaign Preview</h4>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <Tabs value={activePreviewTab} onValueChange={setActivePreviewTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto p-0">
                  <TabsTrigger value="campaignDetail">Main Page</TabsTrigger>
                  <TabsTrigger value="earnPoints">Earn Points</TabsTrigger>
                  <TabsTrigger value="redeemPoints">Redeem Points</TabsTrigger>
                  <TabsTrigger value="contactUs">Contact Us</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                </TabsList>
                <div className="h-[600px] overflow-y-auto relative p-4">
                  <TabsContent value="campaignDetail">
                    <CampaignDetailPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="earnPoints">
                    <EarnPointsPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="redeemPoints">
                    <RedeemPointsPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="contactUs">
                    <ContactUsPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="footer">
                    <FooterPreview campaignData={formData} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          <h4 className="text-lg font-semibold mb-3 mt-6">Distribution Channels</h4>
          <div className="grid gap-2 mb-6 text-sm">
            <p><strong>QR Code:</strong> {formData.distributionChannels.qrCode ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Share Link:</strong> {formData.distributionChannels.shareLink ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Embed Button:</strong> {formData.distributionChannels.embedButton ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Email Send:</strong> {formData.distributionChannels.emailSend ? 'Enabled' : 'Disabled'}</p>
          </div>

          <h4 className="text-lg font-semibold mb-3">Scheduling & Auto Rules</h4>
          <div className="grid gap-2 mb-6 text-sm">
            <p><strong>Stop after claims:</strong> {Number(formData.schedulingRules.stopAfterClaims) > 0 ? formData.schedulingRules.stopAfterClaims : 'Unlimited'}</p>
            <p><strong>Pause on reward empty:</strong> {formData.schedulingRules.pauseOnRewardEmpty ? 'Yes' : 'No'}</p>
            <p><strong>Auto-switch to points:</strong> {formData.schedulingRules.autoSwitchToPoints ? 'Yes' : 'No'}</p>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={handleCreateCampaign}>Create Campaign</Button>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your new campaign has been created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogAcknowledge}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}