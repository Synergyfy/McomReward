"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Gift, Megaphone, Flame, Percent, Star, ArrowUp, ArrowDown, Plus, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetGeneralAnalytics, useGetChartData } from "@/services/business-dashboard/hook";
import Loader from "@/components/ui/loader";
import { ChartQueryDto } from "@/services/business-dashboard/types";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: analyticsData, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useGetGeneralAnalytics();
  const { data: chartData, isLoading: isChartLoading, isError: isChartError } = useGetChartData({ period: timeRange });

  const selectedTimeRangeLabel = timeRangeOptions.find(option => option.value === timeRange)?.label;

  if (isAnalyticsLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader /></div>;
  }

  if (isAnalyticsError) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-red-500">Error loading analytics data.</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* === Overview Stats === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Customers" value={analyticsData?.totalCustomers ?? 0} icon={<Users className="text-orange-500" />} />
        <StatCard title="Rewards Redeemed" value={analyticsData?.totalRewardsRedeemed ?? 0} icon={<Gift className="text-orange-500" />} />
        <StatCard title="Total Campaigns" value={analyticsData?.totalCampaigns ?? 0} icon={<Megaphone className="text-orange-500" />} />
        <StatCard title="Total Active Campaigns" value={analyticsData?.totalActiveCampaigns ?? 0} icon={<Flame className="text-orange-500" />} />
        <StatCard title="Points Redeemed" value={analyticsData?.totalPointsRedeemed ?? 0} icon={<Percent className="text-orange-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <TierProgress tier={{ name: "Gold", progress: 75 }} />
        <PointsSummary summary={{ earned: analyticsData?.totalPointsEarned ?? 0, spent: analyticsData?.totalPointsRedeemed ?? 0, matchingAvailable: 5000 }} />
      </div>

      {/* === Chart Section === */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance ({selectedTimeRangeLabel})</CardTitle>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isChartLoading ? <Loader /> : isChartError ? <p className="text-red-500">Error loading chart data.</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.data}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #f97316",
                  }}
                  cursor={{ fill: "#fff7ed" }}
                />
                <Legend />
                <Bar dataKey="pointsEarned" name="Points Earned" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pointsRedeemed" name="Points Redeemed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* === Active Campaigns === */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData?.activeCampaigns && analyticsData.activeCampaigns.length > 0 ? (
            <ul className="space-y-3">
              {analyticsData.activeCampaigns.map((c, i) => (
                <li key={i} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-800">{c.name}</span>
                  <span className="text-sm text-orange-600">{c.customerCount} customers</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No active campaigns.</p>
          )}
        </CardContent>
      </Card>

      {/* === Recent Activity === */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData?.lastTenActivities && analyticsData.lastTenActivities.length > 0 ? (
            <ul className="space-y-4">
              {analyticsData.lastTenActivities.map((a) => (
                <li key={a.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{a.participant?.name || "Unknown User"}</span>
                    <span className="text-xs text-gray-500">{a.participant?.email}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className={`flex items-center gap-1 font-bold ${a.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                      {a.type === 'EARN' ? <Plus size={14} strokeWidth={3} /> : <Minus size={14} strokeWidth={3} />}
                      {a.points}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-700 uppercase mr-1">{a.type}</span>
                      <span className="text-xs text-gray-500">- {a.description}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card className="shadow-md border-none bg-white">
    <CardHeader className="flex flex-row justify-between items-center pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </CardContent>
  </Card>
);

const TierProgress = ({ tier }: { tier: { name: string; progress: number } }) => (
  <Card className="shadow-md border-none bg-white lg:col-span-1">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Business Tier</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-2">
        <span className="text-orange-500 font-bold text-xl">{tier.name}</span>
        <Star className="text-yellow-400 fill-yellow-400" />
      </div>
      <Progress value={tier.progress} className="w-full" />
      <p className="text-sm text-gray-500 mt-2">{tier.progress}% to the next tier</p>
    </CardContent>
  </Card>
);

const PointsSummary = ({ summary }: { summary: { earned: number; spent: number; matchingAvailable: number } }) => (
  <Card className="shadow-md border-none bg-white lg:col-span-2">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Points Summary</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-sm text-gray-500">Earned</p>
        <p className="text-2xl font-bold flex items-center justify-center gap-1 text-green-600">
          <ArrowUp size={20} /> {summary.earned.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Spent</p>
        <p className="text-2xl font-bold flex items-center justify-center gap-1 text-red-600">
          <ArrowDown size={20} /> {summary.spent.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Matching Available</p>
        <p className="text-2xl font-bold text-blue-600">{summary.matchingAvailable.toLocaleString()}</p>
      </div>
    </CardContent>
  </Card>
);
