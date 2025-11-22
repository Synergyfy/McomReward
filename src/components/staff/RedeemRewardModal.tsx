"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Loader2, ScanLine, Gift, Receipt, CheckCircle } from "lucide-react";
import { useScanParticipant, useGenerateCode } from "@/services/participant-campaign-balance/hook";
import { toast } from "sonner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { OngoingCampaignReward } from "@/services/campaigns/types";

interface RedeemRewardModalProps {
  campaignId: string;
  reward: OngoingCampaignReward;
}

export function RedeemRewardModal({ campaignId, reward }: RedeemRewardModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Direct Redeem State
  const [participantCode, setParticipantCode] = useState("");
  const [isScanningQR, setIsScanningQR] = useState(false);

  // Generate Voucher State
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const { mutateAsync: scanParticipant, isPending: isRedeeming } = useScanParticipant();
  const { mutateAsync: generateCode, isPending: isGenerating } = useGenerateCode();

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scanParticipant({
        campaignId,
        participantCode,
        type: 'REDEEM',
        rewardId: reward.id
        // Points are not sent for REDEEM as per documentation
      });
      toast.success(`Successfully redeemed "${reward.title}" for ${participantCode}`);
      setIsOpen(false);
      setParticipantCode("");
    } catch (error) {
      toast.error("Failed to redeem reward. Check balance or code.");
      console.error(error);
    }
  };

  const handleGenerateVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate expiresAt (default: 7 days from now)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const result = await generateCode({
        campaignId,
        type: 'REDEEM',
        rewardId: reward.id,
        expiresAt
      });
      setGeneratedCode(result.code);
      toast.success("Voucher code generated successfully!");
    } catch (error) {
      toast.error("Failed to generate voucher code.");
      console.error(error);
    }
  };

  const handleQRScan = (result: { rawValue: string }[]) => {
    if (result && result.length > 0) {
      setParticipantCode(result[0].rawValue);
      setIsScanningQR(false);
      toast.success("QR Code Scanned!");
    }
  };

  const resetState = () => {
    setParticipantCode("");
    setIsScanningQR(false);
    setGeneratedCode(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetState(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white">
          Redeem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-orange-500" />
            Redeem Reward
          </DialogTitle>
          <DialogDescription>
            Redeem <strong>{reward.title}</strong> for <strong>{reward.pointsRequired} points</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex gap-2 items-center">
              <QrCode className="h-4 w-4" />
              <span>Direct Redeem</span>
            </TabsTrigger>
            <TabsTrigger value="voucher" className="flex gap-2 items-center">
              <Receipt className="h-4 w-4" />
              <span>Create Voucher</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Direct Redeem */}
          <TabsContent value="direct" className="space-y-4 py-4">
            {isScanningQR ? (
              <div className="relative w-full aspect-square max-w-[300px] mx-auto bg-black rounded-lg overflow-hidden">
                <Scanner
                  onScan={handleQRScan}
                  allowMultiple={true}
                  scanDelay={2000}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  onClick={() => setIsScanningQR(false)}
                >
                  Cancel Scan
                </Button>
              </div>
            ) : (
               <div className="flex justify-center">
                  <Button variant="secondary" onClick={() => setIsScanningQR(true)} className="gap-2 w-full">
                      <ScanLine className="h-4 w-4" />
                      Scan Participant QR
                  </Button>
               </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter code manually
                </span>
              </div>
            </div>

            <form onSubmit={handleRedeemSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="participant-code">Participant Code</Label>
                <Input
                  id="participant-code"
                  placeholder="e.g., ALICE0001"
                  value={participantCode}
                  onChange={(e) => setParticipantCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isRedeeming}>
                {isRedeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : `Deduct ${reward.pointsRequired} Points & Redeem`}
              </Button>
            </form>
          </TabsContent>

          {/* Tab 2: Generate Voucher */}
          <TabsContent value="voucher" className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Create a voucher code for this reward that the participant can claim later. The code will expire in 7 days.
            </p>

            {!generatedCode ? (
              <form onSubmit={handleGenerateVoucherSubmit} className="space-y-4">
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Voucher Code"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 bg-green-50 p-6 rounded-lg border border-green-100">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">Voucher Generated!</p>
                  <p className="text-3xl font-mono font-bold tracking-widest text-gray-900 mt-2">{generatedCode}</p>
                  <p className="text-xs text-gray-500 mt-2">Give this code to the participant.</p>
                </div>
                <Button variant="outline" onClick={() => setGeneratedCode(null)} className="w-full">
                  Create Another
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
