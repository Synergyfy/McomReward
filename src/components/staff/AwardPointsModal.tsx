"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Receipt, Phone, Loader2, CheckCircle, ScanLine } from "lucide-react";
import { useScanParticipant, useGenerateCode, useDualScan } from "@/services/participant-campaign-balance/hook";
import { useGetBusinessMonthlyBalance } from "@/services/business/hook";
import { toast } from "sonner";
import { Scanner } from "@yudiel/react-qr-scanner";

interface AwardPointsModalProps {
  campaignId: string;
  campaignName: string;
  staffCode?: string;
}

export function AwardPointsModal({ campaignId, campaignName, staffCode }: AwardPointsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState<number>(50);

  // Method A State
  const [participantCodeA, setParticipantCodeA] = useState("");
  const [isScanningQR, setIsScanningQR] = useState(false);

  // Method C State
  const [participantCodeC, setParticipantCodeC] = useState("");
  const [staffCodeInput, setStaffCodeInput] = useState(staffCode || "");

  // Results
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const { mutateAsync: scanParticipant, isPending: isScanning } = useScanParticipant();
  const { mutateAsync: generateCode, isPending: isGenerating } = useGenerateCode();
  const { mutateAsync: dualScan, isPending: isDualScanning } = useDualScan();
  const { data: balanceData } = useGetBusinessMonthlyBalance();

  const checkAndToastAllowanceWarning = (addedPoints: number) => {
    if (!balanceData) return;

    const limit = balanceData.monthlyLimit;
    const used = balanceData.used;

    if (limit <= 0) return; // Unlimited or invalid

    const prePercent = (used / limit) * 100;
    const postUsed = used + addedPoints;
    const postPercent = (postUsed / limit) * 100;

    if (prePercent < 80 && postPercent >= 80) {
      toast.warning(`You have used over 80% of your monthly point allowance (${postPercent.toFixed(1)}%).`);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await scanParticipant({
        campaignId,
        participantCode: participantCodeA,
        points,
        type: 'EARN'
      });

      // Trigger 3: Points Awarded
      toast.success(`You awarded ${points} points to ${participantCodeA}.`);

      // Trigger 2: Campaign Joined
      // Check if message implies joining (This is a heuristic as API doesn't return explicit flag)
      if (response.message && response.message.toLowerCase().includes("joined")) {
        toast.info(`Participant ${participantCodeA} has joined campaign ${campaignName}.`);
      }

      // Trigger 1: Allowance Warning
      checkAndToastAllowanceWarning(points);

      setIsOpen(false);
      setParticipantCodeA("");
    } catch (error) {
      toast.error("Failed to award points via scan.");
      console.error(error);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate expiresAt (default: 7 days from now)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const result = await generateCode({
        campaignId,
        points,
        type: 'EARN',
        expiresAt
      });
      setGeneratedCode(result.code);
      toast.success("Claim code generated successfully!");

      // Note: Allowance warning not triggered here as points are not deducted until claimed?
      // Or should it be? Usually usage counts when points are issued/claimed.
      // Assuming usage updates on claim for generated codes, so no warning here.

    } catch (error) {
      toast.error("Failed to generate code.");
      console.error(error);
    }
  };

  const handleDualScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await dualScan({
        campaignId,
        participantCode: participantCodeC,
        staffOrBusinessCode: staffCodeInput,
        points,
        type: 'EARN'
      });

      // Trigger 3: Points Awarded
      toast.success(`You awarded ${points} points to ${participantCodeC}.`);

      // Trigger 2: Campaign Joined
      if (response.message && response.message.toLowerCase().includes("joined")) {
        toast.info(`Participant ${participantCodeC} has joined campaign ${campaignName}.`);
      }

      // Trigger 1: Allowance Warning
      checkAndToastAllowanceWarning(points);

      setIsOpen(false);
      setParticipantCodeC("");
    } catch (error) {
      toast.error("Failed to award points via dual verification.");
      console.error(error);
    }
  };

  const resetState = () => {
    setGeneratedCode(null);
    setParticipantCodeA("");
    setParticipantCodeC("");
    setPoints(50);
    setIsScanningQR(false);
  };

  const handleQRScan = (result: { rawValue: string }[]) => {
    if (result && result.length > 0) {
      setParticipantCodeA(result[0].rawValue);
      setIsScanningQR(false);
      toast.success("QR Code Scanned!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetState(); }}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full md:w-auto">
          <QrCode className="h-4 w-4" />
          Award Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Award Points</DialogTitle>
          <DialogDescription>
            Choose a method to award points for <strong>{campaignName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scan" className="flex gap-2 items-center">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Direct Scan</span>
            </TabsTrigger>
            <TabsTrigger value="receipt" className="flex gap-2 items-center">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Code</span>
            </TabsTrigger>
            <TabsTrigger value="dual" className="flex gap-2 items-center">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Remote/Phone</span>
            </TabsTrigger>
          </TabsList>

          {/* Method A: Direct Scan */}
          <TabsContent value="scan" className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Use this when the customer is present and shows their QR code.
              </p>

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
                    <Button variant="secondary" onClick={() => setIsScanningQR(true)} className="gap-2">
                        <ScanLine className="h-4 w-4" />
                        Scan QR Code
                    </Button>
                 </div>
              )}

              <form onSubmit={handleScanSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="points-a">Points to Award</Label>
                  <Input
                    id="points-a"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participant-code-a">Participant Unique Code (from QR)</Label>
                  <Input
                    id="participant-code-a"
                    placeholder="e.g., ALICE0001"
                    value={participantCodeA}
                    onChange={(e) => setParticipantCodeA(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isScanning}>
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Award Points"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Method B: Generate Code */}
          <TabsContent value="receipt" className="space-y-4 py-4">
             <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Generate a code to write on a receipt for the customer to claim later. (Valid for 7 days)
              </p>
              {!generatedCode ? (
                <form onSubmit={handleGenerateSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="points-b">Points to Award</Label>
                    <Input
                      id="points-b"
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      min={1}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Code"}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 bg-green-50 p-6 rounded-lg border border-green-100">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Code Generated Successfully!</p>
                    <p className="text-3xl font-mono font-bold tracking-widest text-gray-900 mt-2">{generatedCode}</p>
                    <p className="text-xs text-gray-500 mt-2">Write this on the receipt.</p>
                  </div>
                  <Button variant="outline" onClick={() => setGeneratedCode(null)} className="w-full">
                    Generate Another
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Method C: Dual Scan */}
          <TabsContent value="dual" className="space-y-4 py-4">
             <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Use this for remote orders or when manual verification is needed.
              </p>
              <form onSubmit={handleDualScanSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="points-c">Points to Award</Label>
                  <Input
                    id="points-c"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participant-code-c">Participant Code</Label>
                  <Input
                    id="participant-code-c"
                    placeholder="e.g., ALICE0001"
                    value={participantCodeC}
                    onChange={(e) => setParticipantCodeC(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-code">Staff/Business Code</Label>
                  <Input
                    id="staff-code"
                    placeholder="e.g., BOB456789"
                    value={staffCodeInput}
                    onChange={(e) => setStaffCodeInput(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isDualScanning}>
                   {isDualScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Award"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
