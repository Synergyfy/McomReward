"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ScanLine, Gift } from "lucide-react";
import { useScanParticipant } from "@/services/participant-campaign-balance/hook";
import { toast } from "sonner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { OngoingCampaignReward } from "@/services/campaigns/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RedeemRewardModalProps {
  campaignId: string;
  reward: OngoingCampaignReward;
}

export function RedeemRewardModal({ campaignId, reward }: RedeemRewardModalProps) {
  const canPoints = reward.is_points_enabled || reward.isPointsEnabled || (reward.points_required ?? reward.pointsRequired ?? 0) > 0;
  const canStamps = reward.is_stamps_enabled || reward.isStampsEnabled || (reward.stamps_required ?? reward.stampsRequired ?? 0) > 0;
  const bothEnabled = canPoints && canStamps;

  const [isOpen, setIsOpen] = useState(false);
  const [redemptionMethod, setRedemptionMethod] = useState<'points' | 'stamps'>(canPoints ? 'points' : 'stamps');

  // Direct Redeem State
  const [participantCode, setParticipantCode] = useState("");
  const [isScanningQR, setIsScanningQR] = useState(false);

  const { mutateAsync: scanParticipant, isPending: isRedeeming } = useScanParticipant();

  const currentCost = useMemo(() => {
    if (redemptionMethod === 'points') {
      return `${reward.points_required ?? reward.pointsRequired ?? 0} points`;
    }
    return `${reward.stamps_required ?? reward.stampsRequired ?? 0} stamps`;
  }, [redemptionMethod, reward]);

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scanParticipant({
        campaignId,
        participantCode,
        type: 'REDEEM',
        rewardId: reward.id,
        redemptionMethod: redemptionMethod
      });
      // Trigger 4: Reward Redeemed
      toast.success(`Participant ${participantCode} redeemed reward ${reward.title} via ${redemptionMethod}.`);
      setIsOpen(false);
      setParticipantCode("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to redeem reward. Check balance or code.");
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
    setRedemptionMethod(canPoints ? 'points' : 'stamps');
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
            Redeem <strong>{reward.title}</strong> for <strong>{currentCost}</strong>.
          </DialogDescription>
        </DialogHeader>

        {bothEnabled && (
            <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                <Tabs value={redemptionMethod} onValueChange={(v) => setRedemptionMethod(v as 'points' | 'stamps')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="points">Use Points</TabsTrigger>
                        <TabsTrigger value="stamps">Use Stamps</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        )}

        <div className="space-y-4 py-4">
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
                {isRedeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : `Deduct ${currentCost} & Redeem`}
              </Button>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
