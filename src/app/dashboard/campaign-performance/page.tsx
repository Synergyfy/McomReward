"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BarChart3, Users, Trophy, Percent } from "lucide-react";

// 🧠 Mock Data (you can replace this with your API later)
export interface Campaign {
    id: string;
    name: string;
    sector: string;
    startDate: string;
    endDate: string;
    status: string;
    stats: {
        totalCustomers: number;
        totalPointsAwarded: number;
        totalRewardsRedeemed: number;
        redemptionRate: number;
    };
    lastUpdated: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "cmp001",
    name: "Summer Loyalty Campaign 2025",
    sector: "Restaurants",
    startDate: "2025-06-01",
    endDate: "2025-09-30",
    status: "Active",
    stats: {
      totalCustomers: 1284,
      totalPointsAwarded: 542300,
      totalRewardsRedeemed: 312,
      redemptionRate: 24.3, //Redemption Rate = (Total Points Redeemed / Total Points Awarded) × 100
      
    },
    lastUpdated: "2025-10-07",
  },
  {
    id: "cmp002",
    name: "Holiday Rewards Blast",
    sector: "Retail",
    startDate: "2024-11-15",
    endDate: "2025-01-10",
    status: "Completed",
    stats: {
      totalCustomers: 1840,
      totalPointsAwarded: 732000,
      totalRewardsRedeemed: 490,
      redemptionRate: 26.6,
    },
    lastUpdated: "2025-01-10",
  },
  {
    id: "cmp003",
    name: "Weekend Shopper Rewards",
    sector: "Fashion",
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    status: "Completed",
    stats: {
      totalCustomers: 940,
      totalPointsAwarded: 305000,
      totalRewardsRedeemed: 218,
      redemptionRate: 23.2,
    },
    lastUpdated: "2025-05-31",
  },
  {
    id: "cmp004",
    name: "Tech Fest 2025 Loyalty Program",
    sector: "Electronics",
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    status: "Active",
    stats: {
      totalCustomers: 760,
      totalPointsAwarded: 189000,
      totalRewardsRedeemed: 134,
      redemptionRate: 17.6,
    },
    lastUpdated: "2025-10-20",
  },
  {
    id: "cmp005",
    name: "Fitness Rewards Challenge",
    sector: "Health & Fitness",
    startDate: "2025-07-01",
    endDate: "2025-12-31",
    status: "Active",
    stats: {
      totalCustomers: 560,
      totalPointsAwarded: 145800,
      totalRewardsRedeemed: 95,
      redemptionRate: 16.9,
    },
    lastUpdated: "2025-10-18",
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const router = useRouter();

  useEffect(() => {
    // TODO: Fetch from API later
    setCampaigns(mockCampaigns);
  }, []);

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
                      className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {campaign.sector} • Updated {campaign.lastUpdated}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Users size={16} />{" "}
                    <span>{campaign.stats.totalCustomers} customers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Trophy size={16} />{" "}
                    <span>{campaign.stats.totalRewardsRedeemed} rewards redeemed</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <BarChart3 size={16} />{" "}
                    <span>{campaign.stats.totalPointsAwarded.toLocaleString()} points awarded</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Percent size={16} />{" "}
                    <span>Redemption Rate: {campaign.stats.redemptionRate}%</span>
                  </div>

                  <Progress
                    value={campaign.stats.redemptionRate}
                    className="h-2 mt-2"
                  />

                  <Button
                    onClick={() =>
                      router.push(`/dashboard/${campaign.id}/performance`)
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
      </div>
    </motion.div>
  );
}
