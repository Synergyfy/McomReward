"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart3, Users, Trophy, Percent } from "lucide-react";
import { useGetCampaignPerformance } from "@/services/analytics/hook";
import { CampaignPerformanceData } from "@/services/analytics/types";

const PerformanceCard = ({
  performance,
}: {
  performance: CampaignPerformanceData;
}) => {
  const router = useRouter();
  const { campaign, totalParticipants, totalPointsAwarded, totalRewardsRedeemed, redemptionRate } = performance;

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="transition">
      <Card className="rounded-2xl shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-lg font-semibold text-gray-800">
            {campaign.name}
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                new Date(campaign.end_date) > new Date()
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {new Date(campaign.end_date) > new Date() ? "Active" : "Completed"}
            </span>
          </CardTitle>
          <p className="text-sm text-gray-500">
            Updated {new Date(campaign.updated_at).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Users size={16} /> <span>{totalParticipants} customers</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Trophy size={16} />{" "}
            <span>{totalRewardsRedeemed} rewards redeemed</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <BarChart3 size={16} />{" "}
            <span>{totalPointsAwarded.toLocaleString()} points awarded</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Percent size={16} />{" "}
            <span>Redemption Rate: {redemptionRate.toFixed(2)}%</span>
          </div>

          <Progress value={redemptionRate} className="h-2 mt-2" />

          <Button
            onClick={() =>
              router.push(`/dashboard/campaigns/${campaign.id}/performance`)
            }
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            View Performance
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const { data: performanceData, isLoading } = useGetCampaignPerformance(page);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 p-5 text-center">
          Monitor all your active and completed campaigns in one place.
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading campaign performance...</p>
          </div>
        ) : performanceData?.data && performanceData.data.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {performanceData.data.map((performance) => (
                <PerformanceCard
                  key={performance.campaign.id}
                  performance={performance}
                />
              ))}
            </div>
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-gray-600">
                Page {performanceData.page} of{" "}
                {Math.ceil(performanceData.total / performanceData.limit)}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={
                  page >=
                  Math.ceil(performanceData.total / performanceData.limit)
                }
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No campaign performance data found.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
