"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, Trophy, BarChart3, Percent, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useGetDetailedCampaignAnalytics } from "@/services/campaigns/hook";

export default function CampaignPerformancePage() {
  const { id } = useParams();
  const { data: analytics, isLoading } = useGetDetailedCampaignAnalytics(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h3 className="text-gray-600">Campaign not found.</h3>
      </div>
    );
  }

  const stats = [
    { title: "Total Customers", value: Number(analytics.totalParticipants).toLocaleString(), icon: Users, color: "text-blue-500" },
    { title: "Total Points Awarded", value: analytics.totalPointsAwarded ? Number(analytics.totalPointsAwarded).toLocaleString() : '0', icon: BarChart3, color: "text-black" },
    { title: "Rewards Redeemed", value: Number(analytics.totalRewardsRedeemed).toLocaleString(), icon: Trophy, color: "text-green-500" },
    { title: "Redemption Rate", value: `${analytics.redemptionRate}%`, icon: Percent, color: "text-purple-500" },
  ];

  const trend = analytics.weeklyChartData.map((d) => ({
    date: d.date,
    signups: Number(d.newParticipants),
    redemptions: Number(d.rewardsRedeemed),
    pointsAwarded: Number(d.pointsAwarded),
  }));

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Campaign Performance Overview
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <Card key={s.title} className="p-4 bg-orange-500 hover:bg-orange-600 transition">
              <CardHeader className="flex items-center gap-2">
                <s.icon className={s.color} />
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-gray-800">
                {s.value}
              </CardContent>
            </Card>
          ))}
        </div>

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
                <Line type="monotone" dataKey="redemptions" stroke="#22c55e" name="Redemptions" />
                <Line type="monotone" dataKey="pointsAwarded" stroke="#3b82f6" name="Points Awarded" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="border-b text-gray-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th>Points</th>
                    <th>Redemptions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.rankedParticipants.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-orange-200">
                      <td className="py-2 font-medium">{p.pName || p.id}</td>
                      <td>{Number(p.totalPointsEarned).toLocaleString()}</td>
                      <td>{Number(p.totalRedemptions).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="border-b text-gray-500">
                  <tr>
                    <th className="py-2">Reward</th>
                    <th>Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topRewards.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-orange-200">
                      <td className="py-2 font-medium">{r.rTitle}</td>
                      <td>{Number(r.totalRedemptions).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
