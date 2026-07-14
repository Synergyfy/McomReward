'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CampaignResponse } from '@/services/campaigns/types';
import { Loader2, ScanLine, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useScanParticipant } from '@/services/participant-campaign-balance/hook';
import { toast } from 'sonner';

interface AwardPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: CampaignResponse[];
}

export default function AwardPointsModal({ isOpen, onClose, campaigns }: AwardPointsModalProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [points, setPoints] = useState<number>(100); // Default points
  const [isScanning, setIsScanning] = useState(false);
  const [recipientCode, setRecipientCode] = useState('');

  const { mutate: scanParticipant, isPending } = useScanParticipant();

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      setRecipientCode(result[0].rawValue);
      setIsScanning(false);
      toast.success('QR Code scanned successfully');
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    // toast.error('Error scanning QR code');
  };

  const handleSubmit = () => {
    if (!selectedCampaignId) {
      toast.error('Please select a campaign');
      return;
    }
    if (!recipientCode) {
       toast.error('Please scan a QR code or enter a recipient code');
       return;
    }
    if (points <= 0) {
        toast.error('Points must be greater than 0');
        return;
    }

    scanParticipant({
        campaignId: selectedCampaignId,
        participantCode: recipientCode,
        type: 'EARN',
        points: points
    }, {
        onSuccess: () => {
            toast.success('Points awarded successfully!');
            onClose();
            // Reset form
            setRecipientCode('');
            setSelectedCampaignId('');
        },
        onError: (error: any) => {
             toast.error(error.response?.data?.message || 'Failed to award points');
        }
    });
  };

  // Filter only active campaigns
  const activeCampaigns = campaigns.filter(c => !c.disabled);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Award Matching Points</DialogTitle>
          <DialogDescription>
            Select a campaign and scan the recipient's QR code to award points.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          {/* Campaign Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Campaign</label>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {activeCampaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
                {activeCampaigns.length === 0 && (
                    <div className="p-2 text-sm text-gray-500 text-center">No active matching campaigns</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Points Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Points to Award</label>
            <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
            />
          </div>

          {/* Scanner / Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient Code</label>
            <div className="flex gap-2">
                <Input
                    value={recipientCode}
                    onChange={(e) => setRecipientCode(e.target.value)}
                    placeholder="Enter code or scan QR"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsScanning(true)}
                    type="button"
                >
                    <ScanLine className="h-4 w-4" />
                </Button>
            </div>
          </div>

          {/* Camera View */}
          {isScanning && (
            <div className="relative mt-2 rounded-lg overflow-hidden border bg-black">
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                 onClick={() => setIsScanning(false)}
               >
                 <X className="h-4 w-4" />
               </Button>
               <div className="aspect-square">
                 <Scanner
                    onScan={handleScan}
                    onError={handleError}
                 />
               </div>
               <div className="absolute bottom-2 left-0 right-0 text-center text-white text-xs">
                 Align QR code within frame
               </div>
            </div>
          )}

        </div>

        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !selectedCampaignId || !recipientCode}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Award Points
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
