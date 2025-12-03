"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, BarChart3, Percent, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import Link from "next/link";
import { mockCampaignDetails, CampaignPerformance } from "@/lib/mock-data/campaign-performance";


export default function CampaignPerformancePage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<CampaignPerformance | null>(null);

  useEffect(() => {
    const campaignData = mockCampaignDetails[id as string];
    if (campaignData) setCampaign(campaignData);
}, [id]);

if (campaign === null) {
  return (
    <div className="flex items-center justify-center min-h-screen">
     <h3 className="text-gray-600">Campaign not found.</h3>
    </div>
  );
}

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }


  const { stats, trend, topCustomers, rewardsPerformance } = campaign;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          {/* <Link href="/business/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Campaigns
            </Button>
          </Link> */}
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            {campaign.name} – Performance Overview
          </h1>
        </div>

        {/* 🔹 Stats Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-orange-500 hover:bg-orange-600 transition">
            <CardHeader className="flex items-center gap-2">
              <Users className="text-blue-500" />
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-gray-800">
              {stats.totalCustomers}
            </CardContent>
          </Card>

          <Card className="p-4 bg-orange-500 hover:bg-orange-600 transition">
            <CardHeader className="flex items-center gap-2">
              <BarChart3 className="text-black" />
              <CardTitle>Total Points Awarded</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-gray-800">
              {stats.totalPointsAwarded.toLocaleString()}
            </CardContent>
          </Card>

          <Card className="p-4 bg-orange-500 hover:bg-orange-600 transition">
            <CardHeader className="flex items-center gap-2">
              <Trophy className="text-green-500" />
              <CardTitle>Rewards Redeemed</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-gray-800">
              {stats.totalRewardsRedeemed}
            </CardContent>
          </Card>

          <Card className="p-4 bg-orange-500 hover:bg-orange-600 transition">
            <CardHeader className="flex items-center gap-2">
              <Percent className="text-purple-500" />
              <CardTitle>Redemption Rate</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-gray-800">
              {stats.redemptionRate}%
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Trend Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="signups" stroke="#f97316" name="Signups" />
                <Line
                  type="monotone"
                  dataKey="redemptions"
                  stroke="#22c55e"
                  name="Redemptions"
                />
                <Line
                  type="monotone"
                  dataKey="pointsAwarded"
                  stroke="#3b82f6"
                  name="Points Awarded"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 🔹 Top Customers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Points</th>
                  <th>Redemptions</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((cust, idx) => (
                  <tr key={idx} className="border-b  hover:bg-orange-200">
                    <td className="py-2 font-medium">{cust.name}</td>
                    <td>{cust.email}</td>
                    <td>{cust.points}</td>
                    <td>{cust.redemptions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 🔹 Rewards Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="py-2">Reward</th>
                  <th>Points Required</th>
                  <th>Redeemed</th>
                </tr>
              </thead>
              <tbody>
                {rewardsPerformance.map((reward) => (
                  <tr key={reward.rewardId} className="border-b hover:bg-orange-200">
                    <td className="py-2 font-medium">{reward.title}</td>
                    <td>{reward.pointsRequired}</td>
                    <td>{reward.redeemed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
