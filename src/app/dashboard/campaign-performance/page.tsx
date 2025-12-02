"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart3, Users, Trophy, Percent } from "lucide-react";
import { useGetCampaignAnalytics } from "@/services/campaigns/hook";

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: analyticsData, isLoading } = useGetCampaignAnalytics(page, limit);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <p className="text-lg text-gray-500">Loading campaign analytics...</p>
      </div>
    );
  }

  const campaigns = analyticsData?.data || [];

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


        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No campaign analytics found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                whileHover={{ scale: 1.02 }}
                className="transition"
              >
                <Card className="rounded-2xl shadow-md border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-lg font-semibold text-gray-800">
                      {campaign.name}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${campaign.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {campaign.status}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {campaign.sector || 'N/A'} • {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Users size={16} />{" "}
                      <span>{campaign.totalParticipants} customers</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Trophy size={16} />{" "}
                      <span>{campaign.totalRewardsRedeemed} rewards redeemed</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <BarChart3 size={16} />{" "}
                      <span>{parseInt(campaign.totalPointsAwarded).toLocaleString()} points awarded</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Percent size={16} />{" "}
                      <span>Redemption Rate: {campaign.redemptionRate}%</span>
                    </div>

                    <Progress
                      value={campaign.redemptionRate}
                      className="h-2 mt-2"
                    />

                    <Button
                      onClick={() =>
                        router.push(`/dashboard/campaign-performance/${campaign.id}`)
                      }
                      className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      View Performance
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {analyticsData && analyticsData.total > 0 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-gray-600">
              Page {analyticsData.page} of{' '}
              {Math.ceil(analyticsData.total / analyticsData.limit)}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={
                page >=
                Math.ceil(analyticsData.total / analyticsData.limit)
              }
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
