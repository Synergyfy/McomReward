"use client";

import { useRouter } from "next/navigation";
import { useGetCampaignAnalytics } from "@/services/business-campaign/hooks";
import { CampaignAnalytics } from "@/services/business-campaign/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CampaignPerformancePage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetCampaignAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-10 w-10 text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle />
          <span>Error loading campaign analytics: {error.message}</span>
        </div>
      </div>
    );
  }

  const campaigns = data?.data || [];

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 p-5 text-center">
          Campaign Performance Analytics
        </h1>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold">Campaign Name</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Participants</TableHead>
                <TableHead className="font-semibold text-right">Points Awarded</TableHead>
                <TableHead className="font-semibold text-right">Rewards Redeemed</TableHead>
                <TableHead className="font-semibold text-right">Redemption Rate</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign: CampaignAnalytics) => (
                <TableRow key={campaign.id} className="hover:bg-gray-50">
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{campaign.total_participants}</TableCell>
                  <TableCell className="text-right">{campaign.total_points_awarded}</TableCell>
                  <TableCell className="text-right">{campaign.total_rewards_redeemed}</TableCell>
                  <TableCell className="text-right">{campaign.redemption_rate}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/campaign-performance/${campaign.id}`
                        )
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      View Performance
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {campaigns.length === 0 && (
          <p className="text-center text-gray-500 mt-12">
            No campaign analytics found.
          </p>
        )}
      </div>
    </motion.div>
  );
}
