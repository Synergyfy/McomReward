"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Gift,
  Award,
  Users,
  Zap,
} from "lucide-react";
import { useGetGeneralAnalytics, useGetChartData } from "@/services/business-dashboard/hook";
import Loader from "@/components/ui/loader";

const MAX_REWARDS = 5;
const MAX_CAMPAIGNS = 5;

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useGetGeneralAnalytics();
  const { data: chartData, isLoading: isChartLoading } = useGetChartData({ period: "1y" });

  const topRewards = useMemo(() => {
    if (!analytics?.lastTenActivities) return [];
    const rewardMap = new Map<string, number>();
    analytics.lastTenActivities.forEach((a) => {
      if (a.type === "REDEEM" && a.description) {
        const key = a.description;
        rewardMap.set(key, (rewardMap.get(key) || 0) + 1);
      }
    });
    const total = [...rewardMap.values()].reduce((s, v) => s + v, 0);
    return [...rewardMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_REWARDS)
      .map(([name, redemptions]) => ({
        name,
        redemptions,
        percentage: total > 0 ? Math.round((redemptions / total) * 100) : 0,
      }));
  }, [analytics]);

  const topCampaigns = useMemo(() => {
    if (!analytics?.activeCampaigns) return [];
    const totalReach = analytics.activeCampaigns.reduce((s, c) => s + c.customerCount, 0);
    return analytics.activeCampaigns
      .slice(0, MAX_CAMPAIGNS)
      .map((c) => ({
        name: c.name,
        reach: c.customerCount,
        conversions: Math.round(c.customerCount * 0.15),
        roi: Math.round(c.customerCount * 2.5),
      }));
  }, [analytics]);

  const growthData = useMemo(() => {
    if (!chartData?.data) return [];
    return chartData.data.map((d) => ({
      month: new Date(d.date).toLocaleDateString("en-GB", { month: "short" }),
      customers: d.pointsEarned,
    }));
  }, [chartData]);

  if (isLoading || isChartLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;
  }

  const kpis = {
    repeatCustomerRate: analytics?.repeatCustomerRate ?? 0,
    redemptionRate: analytics?.redemptionRate ?? 0,
    averageSpend: analytics?.averageSpend ?? 0,
    customerLtv: analytics?.customerLtv ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Charts, reports, and insights about your loyalty programme</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            icon={Users}
            label="Repeat Customer Rate"
            value={`${kpis.repeatCustomerRate}%`}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <MetricCard
            icon={Zap}
            label="Redemption Rate"
            value={`${kpis.redemptionRate}%`}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <MetricCard
            icon={DollarSign}
            label="Avg Customer Spend"
            value={`£${kpis.averageSpend}`}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <MetricCard
            icon={TrendingUp}
            label="Customer Lifetime Value"
            value={`£${kpis.customerLtv}`}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Customer Growth Chart */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Points Activity (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
            <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <XAxis dataKey="month" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #f97316" }}
                  cursor={{ fill: "#fff7ed" }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="customers" name="Points Earned" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Most Redeemed Reward + Best Campaign */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Most Redeemed Reward */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-base sm:text-lg">Most Redeemed Rewards</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
              {topRewards.length > 0 ? (
                <div className="space-y-3">
                  {topRewards.map((reward, i) => (
                    <div key={reward.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{reward.name}</p>
                        <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                            style={{ width: `${reward.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{reward.redemptions}</p>
                        <p className="text-[10px] text-gray-500">{reward.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reward data available yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Best Performing Campaign */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-base sm:text-lg">Active Campaigns</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
              {topCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {topCampaigns.map((camp, i) => (
                    <div key={camp.name} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                          i === 0 ? "bg-orange-500" : i === 1 ? "bg-gray-500" : i === 2 ? "bg-amber-600" : "bg-gray-400"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                          <p className="text-[10px] text-gray-500">{camp.reach} customers</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold flex-shrink-0 ml-2 bg-orange-50 text-orange-700 border-orange-200">
                        {camp.roi} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No campaign data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── METRIC CARD COMPONENT ──────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  bgColor,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className={`p-2 rounded-xl ${bgColor}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 flex-1">{label}</p>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}
