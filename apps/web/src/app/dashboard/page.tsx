"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Gift, Megaphone, Percent, Star, ArrowUp, ArrowDown, Eye, Plus, Minus, TrendingUp, RefreshCw, CheckCircle, PlusCircle, CreditCard, Stamp, List } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetGeneralAnalytics, useGetChartData } from "@/services/business-dashboard/hook";
import { useGetMySubscription } from '@/services/tiers/hook';
import { useGetBusinessProfile } from "@/services/business/hook";
import { useGetMatchingPointBalance } from "@/services/matching-points/hook";
import Loader from "@/components/ui/loader";
import type { ChartQueryDto } from "@/services/business-dashboard/types";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

export default function BusinessDashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: analyticsData, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useGetGeneralAnalytics();
  const { data: chartData, isLoading: isChartLoading, isError: isChartError } = useGetChartData({ period: timeRange });
  const { data: subscription, isLoading: isLoadingSubscription } = useGetMySubscription();
  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();
  const { data: matchingBalanceData } = useGetMatchingPointBalance();

  const selectedTimeRangeLabel = timeRangeOptions.find(option => option.value === timeRange)?.label;

  const displayData = analyticsData;
  const displayChart = chartData;

  const dm = displayData || {
    totalMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    activeCampaigns: [] as { name: string; customerCount: number }[],
    giftCardsIssued: 0,
    giftCardsRedeemed: 0,
    repeatCustomerRate: 0,
    revenueGenerated: 0,
  };

  const displayMetrics = {
    totalMembers: dm.totalMembers ?? 0,
    totalPointsIssued: dm.totalPointsIssued ?? 0,
    totalPointsRedeemed: dm.totalPointsRedeemed ?? 0,
    activeCampaigns: Array.isArray(dm.activeCampaigns) ? dm.activeCampaigns.length : (dm.activeCampaigns ?? 0),
    giftCardsIssued: dm.giftCardsIssued ?? 0,
    giftCardsRedeemed: dm.giftCardsRedeemed ?? 0,
    repeatCustomerRate: dm.repeatCustomerRate ?? 0,
    revenueGenerated: dm.revenueGenerated ?? 0,
  };

  const isSuperBusiness = profile?.isSuperBusiness;
  const tierName = isSuperBusiness ? 'Super Business' : (subscription?.tier?.name || 'Starter');
  const tierProgress = isSuperBusiness ? 100 : ((subscription?.tier as any)?.progress || 35);

  if (isAnalyticsLoading || isLoadingSubscription || isProfileLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500">Your loyalty programme at a glance</p>
      </div>

      {/* KPI Cards - 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-orange-100 rounded-xl"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.totalMembers}</p><p className="text-[10px] sm:text-xs text-gray-500">Total Members</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-green-100 rounded-xl"><ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.totalPointsIssued.toLocaleString()}</p><p className="text-[10px] sm:text-xs text-gray-500">Points Issued</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-red-100 rounded-xl"><ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.totalPointsRedeemed.toLocaleString()}</p><p className="text-[10px] sm:text-xs text-gray-500">Points Redeemed</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-purple-100 rounded-xl"><Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.activeCampaigns}</p><p className="text-[10px] sm:text-xs text-gray-500">Active Campaigns</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-100 rounded-xl"><Gift className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.giftCardsIssued}</p><p className="text-[10px] sm:text-xs text-gray-500">Gift Cards Issued</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-blue-100 rounded-xl"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.giftCardsRedeemed}</p><p className="text-[10px] sm:text-xs text-gray-500">Gift Cards Redeemed</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-100 rounded-xl"><RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{displayMetrics.repeatCustomerRate}%</p><p className="text-[10px] sm:text-xs text-gray-500">Repeat Rate</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-indigo-100 rounded-xl"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" /></div>
            <div><p className="text-lg sm:text-2xl font-bold text-gray-900">£{displayMetrics.revenueGenerated.toLocaleString()}</p><p className="text-[10px] sm:text-xs text-gray-500">Revenue</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6 sm:mb-8 shadow-sm border border-gray-100">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            <Button onClick={() => router.push('/dashboard/campaigns/list')} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Create Campaign
            </Button>
            <Button onClick={() => router.push('/dashboard/stamp-rewards?action=claimReward')} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Add Reward
            </Button>
            <Button onClick={() => router.push('/dashboard/stamp-rewards?action=claimReward')} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <Stamp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Create Stamp Card
            </Button>
            <Button onClick={() => router.push('/dashboard/customers')} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />View Customers
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
        <TierProgress tier={{ name: tierName, progress: tierProgress }} />
        <PointsSummary
          summary={{ earned: displayData?.totalPointsEarned || 0, spent: displayData?.totalPointsRedeemed || 0, matchingAvailable: matchingBalanceData?.matching_points || 0 }}
          isTrial={subscription?.isTrial}
          trialQuota={subscription?.tier?.configuration?.quotas?.monthlyPointsAllowance}
        />
      </div>

      {/* Chart */}
      <Card className="mb-6 sm:mb-8 shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-0 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Performance ({selectedTimeRangeLabel})</CardTitle>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[130px] sm:w-[180px] text-xs sm:text-sm h-8 sm:h-10">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={displayChart?.data || []}>
              <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 11 }} />
              <YAxis stroke="#888" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #f97316" }} cursor={{ fill: "#fff7ed" }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="pointsEarned" name="Points Earned" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pointsRedeemed" name="Points Redeemed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="mb-6 sm:mb-8 shadow-sm border border-gray-100">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
          {analyticsData?.activeCampaigns && analyticsData.activeCampaigns.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {analyticsData.activeCampaigns.map((c: { name: string; customerCount: number }, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                  <span className="font-medium text-gray-800 text-xs sm:text-sm truncate mr-2">{c.name}</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-300 bg-white text-[10px] sm:text-xs flex-shrink-0">{c.customerCount} customers</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs sm:text-sm">No active campaigns.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
          {displayData?.lastTenActivities && displayData.lastTenActivities.length > 0 ? (
            <ul className="space-y-2.5 sm:space-y-4">
              {displayData.lastTenActivities.map((a) => (
                <li key={a.id} className="flex justify-between items-center border-b border-gray-100 pb-2.5 sm:pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col min-w-0 mr-2">
                    <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{a.participant?.name || "Unknown User"}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 truncate">{a.participant?.email}</span>
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
    <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
      <CardTitle className="text-sm sm:text-lg font-semibold">Business Tier</CardTitle>
    </CardHeader>
    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-orange-500 font-bold text-lg sm:text-xl">{tier.name}</span>
        <Star className="text-yellow-400 fill-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <Progress value={tier.progress} className="w-full h-2" />
      <p className="text-xs sm:text-sm text-gray-500 mt-2">
        {tier.name === 'Super Business' ? 'Unlimited Access' : `${tier.progress}% to the next tier`}
      </p>
    </CardContent>
  </Card>
);

const PointsSummary = ({ summary, isTrial, trialQuota }: { summary: { earned: number; spent: number; matchingAvailable: number }; isTrial?: boolean; trialQuota?: number; }) => {
  if (isTrial) {
    const remaining = (trialQuota || 0) - summary.spent;
    const isExhausted = remaining <= 0;
    return (
      <Card className="shadow-md border-none bg-white lg:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-bl-lg font-bold">Trial Limit Active</div>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6"><CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">Trial Points{isExhausted && <span className="text-[10px] sm:text-xs bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 rounded-full border border-red-200">Exhausted</span>}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 sm:gap-4 text-center p-3 sm:p-6 pt-0 sm:pt-6">
          <div><p className="text-[10px] sm:text-sm text-gray-500">Allocated</p><p className="text-base sm:text-2xl font-bold text-indigo-600">{(trialQuota || 0).toLocaleString()}</p></div>
          <div><p className="text-[10px] sm:text-sm text-gray-500">Used</p><p className="text-base sm:text-2xl font-bold text-orange-600">{summary.spent.toLocaleString()}</p></div>
          <div><p className="text-[10px] sm:text-sm text-gray-500">Remaining</p><p className={`text-base sm:text-2xl font-bold ${remaining > 0 ? 'text-green-600' : 'text-gray-400'}`}>{Math.max(0, remaining).toLocaleString()}</p></div>
          {isExhausted && <div className="col-span-3 mt-2"><a href="/dashboard/subscription" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition">Upgrade to continue</a></div>}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-md border-none bg-white lg:col-span-2">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6"><CardTitle className="text-sm sm:text-lg font-semibold">Points Summary</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 sm:gap-4 text-center p-3 sm:p-6 pt-0 sm:pt-6">
        <div><p className="text-[10px] sm:text-sm text-gray-500">Earned</p><p className="text-base sm:text-2xl font-bold text-green-600"><ArrowUp size={14} className="inline sm:hidden" /><ArrowUp size={20} className="hidden sm:inline" /> {summary.earned.toLocaleString()}</p></div>
        <div><p className="text-[10px] sm:text-sm text-gray-500">Spent</p><p className="text-base sm:text-2xl font-bold text-red-600"><ArrowDown size={14} className="inline sm:hidden" /><ArrowDown size={20} className="hidden sm:inline" /> {summary.spent.toLocaleString()}</p></div>
        <div><p className="text-[10px] sm:text-sm text-gray-500">Matching</p><p className="text-base sm:text-2xl font-bold text-orange-600">{summary.matchingAvailable.toLocaleString()}</p></div>
      </CardContent>
    </Card>
  );
};
