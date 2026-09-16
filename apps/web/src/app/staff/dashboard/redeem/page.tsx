"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { useGetAllBusinessRewards } from "@/services/rewards/hook";
import { useGetMyCreatedCampaigns } from "@/services/campaigns/hook";
import { useScanParticipant } from "@/services/participant-campaign-balance/hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QrReader = dynamic(() => import("react-qr-reader-es6"), { ssr: false });

type RewardOption = {
  id: string;
  title: string;
  pointsRequired: number;
};

export default function StaffRedeemPage() {
  const form = useForm<{ searchCode: string }>({ defaultValues: { searchCode: "" } });
  const [participantCode, setParticipantCode] = useState<string | null>(null);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [campaignId, setCampaignId] = useState("");
  const [openScanner, setOpenScanner] = useState(false);
  const [notify, setNotify] = useState<{
    type: "success" | "error" | "warning" | null;
    title?: string;
    message?: string;
  }>({ type: null });

  const { data: rewardsData, isLoading: isLoadingRewards } = useGetAllBusinessRewards();
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useGetMyCreatedCampaigns(1, 100);
  const { mutate: scanParticipant, isPending: isRedeeming } = useScanParticipant();

  const rewards: RewardOption[] = (rewardsData?.data ?? [])
    .filter((r) => r.is_points_enabled && !r.disabled)
    .map((r) => ({
      id: r.id,
      title: r.title,
      pointsRequired: r.pointRequired ?? r.maxPoints ?? 0,
    }));

  const campaigns = campaignsData?.data ?? [];

  const showNotify = (type: "success" | "error" | "warning", title: string, message: string) => {
    setNotify({ type, title, message });
    setTimeout(() => setNotify({ type: null }), 3000);
  };

  const handleCodeFound = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setParticipantCode(trimmed);
    setPointsBalance(null);
    showNotify("success", "Participant Found", `Loaded participant code: ${trimmed}`);
  };

  const handleSearch = (data: { searchCode: string }) => {
    handleCodeFound(data.searchCode);
  };

  const handleScan = (data: string | undefined) => {
    if (data) {
      handleCodeFound(data);
      setOpenScanner(false);
    }
  };

  const handleRedeem = (reward: RewardOption) => {
    if (!participantCode) {
      showNotify("warning", "No Participant", "Please enter or scan a participant code first.");
      return;
    }
    if (!campaignId) {
      showNotify("warning", "No Campaign", "Please select a campaign first.");
      return;
    }

    scanParticipant(
      {
        participantCode,
        campaignId,
        type: "REDEEM",
        rewardId: reward.id,
        redemptionMethod: "points",
      },
      {
        onSuccess: (result) => {
          if (result.newBalance != null) {
            setPointsBalance(result.newBalance);
          }
          showNotify(
            "success",
            "Reward Redeemed",
            `${reward.title} successfully redeemed! ${result.message ?? ""}`
          );
        },
        onError: (error: any) => {
          showNotify(
            "error",
            "Redemption Failed",
            error?.response?.data?.message || "Failed to redeem the reward. Check the participant's balance."
          );
        },
      }
    );
  };

  return (
    <div className="min-h-[88vh] bg-white py-10 px-5">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-800">
            Scan a customer QR code or enter their code to redeem rewards.
          </h1>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notify.type && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                variant={
                  notify.type === "success"
                    ? "default"
                    : notify.type === "warning"
                    ? "warning"
                    : "destructive"
                }
                className="border-l-4 border-orange-500 shadow-sm"
              >
                {notify.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                )}
                {notify.type === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
                {notify.type === "error" && (
                  <XCircle className="h-5 w-5 text-orange-500" />
                )}
                <AlertTitle>{notify.title}</AlertTitle>
                <AlertDescription>{notify.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Section */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle>Find Participant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={form.handleSubmit(handleSearch)}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                placeholder="Enter Participant Code (9 characters)"
                {...form.register("searchCode")}
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenScanner(true)}
              >
                Scan QR
              </Button>
            </form>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Campaign</label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCampaigns ? "Loading campaigns..." : "Select campaign"} />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <AnimatePresence>
          {participantCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-md border-orange-200">
                <CardHeader>
                  <CardTitle>Participant Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Participant Code</p>
                      <p className="text-gray-500 text-sm">{participantCode}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                      {pointsBalance != null ? `${pointsBalance} pts` : "Balance shown after redemption"}
                    </Badge>
                  </div>

                  {/* Redeem Buttons */}
                  <div className="space-y-3">
                    <label className="font-medium text-gray-700">Available Rewards</label>

                    {isLoadingRewards ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {rewards.length === 0 && (
                          <p className="text-sm text-gray-500">No point rewards available.</p>
                        )}
                        {rewards.map((reward) => (
                          <div
                            key={reward.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition"
                          >
                            <div>
                              <p className="font-medium text-gray-800">{reward.title}</p>
                              <p className="text-sm text-gray-500">
                                Requires <Badge variant="secondary">{reward.pointsRequired} pts</Badge>
                              </p>
                            </div>

                            <Button
                              size="sm"
                              disabled={isRedeeming}
                              onClick={() => handleRedeem(reward)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              {isRedeeming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Redeem"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanner Modal */}
      <Dialog open={openScanner} onOpenChange={setOpenScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Participant QR Code</DialogTitle>
            <DialogDescription>
              Align the QR code within the frame below.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-lg overflow-hidden border border-orange-200">
            <QrReader
              facingMode="environment"
              onScan={(data: string | null) => {
                if (data) handleScan(data);
              }}
              onError={(err) => console.error(err)}
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setOpenScanner(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}