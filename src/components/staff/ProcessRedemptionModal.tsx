"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Loader2, ScanLine, Gift, Receipt, CheckCircle } from "lucide-react";
import { useScanParticipant, useGenerateCode } from "@/services/participant-campaign-balance/hook";
import { toast } from "sonner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { OngoingCampaignReward } from "@/services/campaigns/types";

interface ProcessRedemptionModalProps {
    campaignId: string;
    campaignName: string;
    rewards: OngoingCampaignReward[];
}

export function ProcessRedemptionModal({ campaignId, campaignName, rewards }: ProcessRedemptionModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRewardId, setSelectedRewardId] = useState<string>("");

    // Direct Redeem State
    const [participantCode, setParticipantCode] = useState("");
    const [isScanningQR, setIsScanningQR] = useState(false);

    // Generate Voucher State
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    const { mutateAsync: scanParticipant, isPending: isRedeeming } = useScanParticipant();
    const { mutateAsync: generateCode, isPending: isGenerating } = useGenerateCode();

    const selectedReward = rewards.find(r => r.id === selectedRewardId);

    const handleRedeemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRewardId) {
            toast.error("Please select a reward first.");
            return;
        }
        try {
            await scanParticipant({
                campaignId,
                participantCode,
                type: 'REDEEM',
                rewardId: selectedRewardId
            });
            toast.success(`Successfully redeemed ${selectedReward?.title} for ${participantCode}.`);
            setIsOpen(false);
            resetState();
        } catch (error) {
            toast.error("Failed to redeem reward. Check balance or code.");
            console.error(error);
        }
    };

    const handleGenerateVoucherSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRewardId) {
            toast.error("Please select a reward first.");
            return;
        }
        try {
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const result = await generateCode({
                campaignId,
                type: 'REDEEM',
                rewardId: selectedRewardId,
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
        setSelectedRewardId("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 w-full md:w-auto">
                    <Gift className="h-4 w-4" />
                    Redeem Reward
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-orange-500" />
                        Process Redemption
                    </DialogTitle>
                    <DialogDescription>
                        Scan a participant and select a reward to redeem for <strong>{campaignName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="reward-select">Select Reward</Label>
                        <Select value={selectedRewardId} onValueChange={setSelectedRewardId}>
                            <SelectTrigger id="reward-select">
                                <SelectValue placeholder="Select a reward to redeem" />
                            </SelectTrigger>
                            <SelectContent>
                                {rewards.filter(r => !r.disabled).map((reward) => (
                                    <SelectItem key={reward.id} value={reward.id}>
                                        {reward.title} ({reward.pointsRequired} pts)
                                    </SelectItem>
                                ))}
                                {rewards.length === 0 && (
                                    <SelectItem value="none" disabled>No rewards available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedRewardId && (
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
                                    <div className="flex justify-center pb-2">
                                        <Button variant="secondary" onClick={() => setIsScanningQR(true)} className="gap-2 w-full">
                                            <ScanLine className="h-4 w-4" />
                                            Scan Participant QR
                                        </Button>
                                    </div>
                                )}

                                <form onSubmit={handleRedeemSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="participant-code">Participant Unique Code (from QR)</Label>
                                        <Input
                                            id="participant-code"
                                            placeholder="e.g., ALICE0001"
                                            value={participantCode}
                                            onChange={(e) => setParticipantCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isRedeeming}>
                                        {isRedeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : `Redeem ${selectedReward?.title}`}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="voucher" className="space-y-4 py-4">
                                <p className="text-sm text-gray-500">
                                    Generate a voucher code that the participant can claim later. (Valid for 7 days)
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
                                            Generate Another
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
