"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";

interface CampaignPerformance {
  campaignId: string;
  name: string;
  duration: {
    start: string;
    end: string;
  };
  stats: {
    totalCustomers: number;
    newSignups: number;
    totalPointsAwarded: number;
    totalRewardsRedeemed: number;
    redemptionRate: number;
    activeCustomers: number;
  };
  trend: {
    date: string;
    signups: number;
    redemptions: number;
  }[];
}

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default function CampaignPerformancePage({ params }: PageProps) {
  const { campaignId } = use(params);
  const [data, setData] = useState<CampaignPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get(`/campaigns/${campaignId}/performance`);
        setData(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load campaign performance.");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [campaignId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-gray-600 mt-20">
        No performance data found.
      </div>
    );

  return (
    <motion.div
      className="p-6 space-y-8 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {data.name}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(data.duration.start).toLocaleDateString()} —{" "}
            {new Date(data.duration.end).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Total Customers</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.stats.totalCustomers}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">New Signups</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.stats.newSignups}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Rewards Redeemed</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.stats.totalRewardsRedeemed}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Total Points Awarded</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.stats.totalPointsAwarded}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Active Customers</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.stats.activeCustomers}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Redemption Rate</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.stats.redemptionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signups Trend */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Daily Signups</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="signups" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Redemption Trend */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Daily Redemptions</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="redemptions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
