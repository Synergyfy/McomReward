"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart3, Users, Trophy, Percent } from "lucide-react";
import { useGetCampaignAnalytics } from "@/services/analytics/hook";
import { CampaignAnalyticsDto } from "@/services/analytics/types";

const PerformanceCard = ({
  analytics,
}: {
  analytics: CampaignAnalyticsDto;
}) => {
  const router = useRouter();
  const { name, sector, status, totalParticipants, totalRewardRedeemed, totalPointAwarded, redemptionRate } = analytics;

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="transition">
      <Card className="rounded-2xl shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-lg font-semibold text-gray-800">
            {name}
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {status}
            </span>
          </CardTitle>
          <p className="text-sm text-gray-500">{sector}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Users size={16} /> <span>{totalParticipants} customers</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Trophy size={16} />{" "}
            <span>{totalRewardRedeemed} rewards redeemed</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <BarChart3 size={16} />{" "}
            <span>{totalPointAwarded.toLocaleString()} points awarded</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Percent size={16} />{" "}
            <span>Redemption Rate: {redemptionRate.toFixed(2)}%</span>
          </div>

          <Progress value={redemptionRate} className="h-2 mt-2" />

          <Button
            onClick={() =>
              router.push(`/dashboard/campaigns/${name}/performance`)
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
  const { data: analyticsData, isLoading } = useGetCampaignAnalytics(page);

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
        ) : analyticsData?.data && analyticsData.data.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {analyticsData.data.map((analytics) => (
                <PerformanceCard
                  key={analytics.name}
                  analytics={analytics}
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
                Page {analyticsData.page} of{" "}
                {Math.ceil(analyticsData.total / analyticsData.limit)}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={!analyticsData.nextPage}
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
