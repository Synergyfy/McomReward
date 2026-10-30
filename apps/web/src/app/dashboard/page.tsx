"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { useGetBusinessTierUsage } from "@/services/business/hook";
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
  const kpiScrollRef = useRef<HTMLDivElement>(null);
  const kpiTrackerDragging = useRef(false);
  const [kpiTracker, setKpiTracker] = useState({ width: 20, left: 0 });

  const { data: analyticsData, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useGetGeneralAnalytics();
  const { data: chartData, isLoading: isChartLoading, isError: isChartError } = useGetChartData({ period: timeRange });
  const { data: subscription, isLoading: isLoadingSubscription } = useGetMySubscription();
  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();
  const { data: matchingBalanceData } = useGetMatchingPointBalance();
  const { data: tierUsage } = useGetBusinessTierUsage();

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
  const subscriptionTierName =
    typeof subscription?.tier === 'string'
      ? subscription.tier
      : subscription?.tier?.name;
  const tierName = isSuperBusiness
    ? 'Super Business'
    : subscriptionTierName || 'Starter';
  const tierLimit = tierUsage?.features?.campaigns?.limit ?? 0;
  const tierUsed = tierUsage?.features?.campaigns?.used ?? 0;
  const tierProgress = isSuperBusiness
    ? 100
    : tierLimit === 0
      ? 0
      : Math.min(100, Math.round((tierUsed / tierLimit) * 100));

  const updateKpiTracker = useCallback(() => {
    const element = kpiScrollRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    const width = element.scrollWidth > 0
      ? Math.min(100, (element.clientWidth / element.scrollWidth) * 100)
      : 100;
    const left = maxScroll > 0
      ? (element.scrollLeft / maxScroll) * (100 - width)
      : 0;
    setKpiTracker({ width, left });
  }, []);

  const moveKpiScrollFromTracker = (clientX: number, track: HTMLDivElement) => {
    const element = kpiScrollRef.current;
    if (!element) return;
    const rect = track.getBoundingClientRect();
    const available = Math.max(1, rect.width * (1 - kpiTracker.width / 100));
    const left = Math.min(available, Math.max(0, clientX - rect.left - (rect.width * kpiTracker.width / 200)));
    const ratio = left / available;
    element.scrollLeft = ratio * (element.scrollWidth - element.clientWidth);
    updateKpiTracker();
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateKpiTracker);
    window.addEventListener("resize", updateKpiTracker);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateKpiTracker);
    };
  }, [updateKpiTracker, isAnalyticsLoading, isLoadingSubscription, isProfileLoading]);

  if (isAnalyticsLoading || isLoadingSubscription || isProfileLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="min-h-screen bg-white px-3 pt-1 pb-3 sm:px-5 sm:pt-2 sm:pb-5 lg:px-7 lg:pt-3 lg:pb-7 xl:px-8 xl:pt-3 xl:pb-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500">Your loyalty programme at a glance</p>
      </div>

      {/* KPI Cards: swipe on mobile, retain the dashboard grid on desktop */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div
          id="dashboard-kpi-scroll"
          ref={kpiScrollRef}
          onScroll={updateKpiTracker}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4"
          aria-label="Business performance statistics"
        >
          {[
            { label: "Total Members", value: displayMetrics.totalMembers.toLocaleString(), Icon: Users, tone: "bg-orange-100 text-orange-600" },
            { label: "Points Issued", value: displayMetrics.totalPointsIssued.toLocaleString(), Icon: ArrowUp, tone: "bg-green-100 text-green-600" },
            { label: "Points Redeemed", value: displayMetrics.totalPointsRedeemed.toLocaleString(), Icon: ArrowDown, tone: "bg-red-100 text-red-600" },
            { label: "Active Campaigns", value: displayMetrics.activeCampaigns.toLocaleString(), Icon: Megaphone, tone: "bg-purple-100 text-purple-600" },
            { label: "Gift Cards Issued", value: displayMetrics.giftCardsIssued.toLocaleString(), Icon: Gift, tone: "bg-amber-100 text-amber-600" },
            { label: "Gift Cards Redeemed", value: displayMetrics.giftCardsRedeemed.toLocaleString(), Icon: CheckCircle, tone: "bg-blue-100 text-blue-600" },
            { label: "Repeat Rate", value: `${displayMetrics.repeatCustomerRate}%`, Icon: RefreshCw, tone: "bg-emerald-100 text-emerald-600" },
            { label: "Revenue", value: `£${displayMetrics.revenueGenerated.toLocaleString()}`, Icon: TrendingUp, tone: "bg-indigo-100 text-indigo-600" },
          ].map(({ label, value, Icon, tone }) => (
            <Card key={label} className="w-[76vw] max-w-[280px] shrink-0 snap-start border border-gray-100 shadow-sm sm:w-auto sm:max-w-none">
              <CardContent className="flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
                <div className={`shrink-0 rounded-xl p-2 sm:p-2.5 ${tone}`}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                <div className="min-w-0"><p className="text-lg font-bold text-gray-900 sm:text-2xl">{value}</p><p className="text-[10px] text-gray-500 sm:text-xs">{label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div
          role="scrollbar"
          aria-label="Scroll through dashboard statistics"
          aria-controls="dashboard-kpi-scroll"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((kpiTracker.left / Math.max(1, 100 - kpiTracker.width)) * 100)}
          tabIndex={0}
          onKeyDown={(event) => {
            const element = kpiScrollRef.current;
            if (!element) return;
            if (event.key === "ArrowRight" || event.key === "PageDown") element.scrollBy({ left: element.clientWidth * 0.8, behavior: "smooth" });
            else if (event.key === "ArrowLeft" || event.key === "PageUp") element.scrollBy({ left: -element.clientWidth * 0.8, behavior: "smooth" });
            else if (event.key === "Home") element.scrollTo({ left: 0, behavior: "smooth" });
            else if (event.key === "End") element.scrollTo({ left: element.scrollWidth, behavior: "smooth" });
            else return;
            event.preventDefault();
          }}
          onPointerDown={(event) => {
            kpiTrackerDragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            moveKpiScrollFromTracker(event.clientX, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (kpiTrackerDragging.current) moveKpiScrollFromTracker(event.clientX, event.currentTarget);
          }}
          onPointerUp={(event) => {
            kpiTrackerDragging.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { kpiTrackerDragging.current = false; }}
          className="relative mx-auto mt-2 h-2 w-32 cursor-pointer touch-none rounded-full bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:hidden"
        >
          <div className="absolute top-0 h-2 rounded-full bg-orange-500 transition-[left,width] duration-100" style={{ left: `${kpiTracker.left}%`, width: `${kpiTracker.width}%` }} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-4 sm:mb-6 lg:mb-8 shadow-sm border border-gray-100">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
        <TierProgress tier={{ name: tierName, progress: tierProgress }} hasPlan={tierLimit > 0} />
        <PointsSummary
          summary={{ earned: displayData?.totalPointsEarned || 0, spent: displayData?.totalPointsRedeemed || 0, matchingAvailable: matchingBalanceData?.matching_points || 0 }}
          isTrial={subscription?.isTrial}
          trialQuota={subscription?.tier?.configuration?.quotas?.monthlyPointsAllowance}
        />
      </div>

      {/* Chart */}
      <Card className="mb-4 sm:mb-6 lg:mb-8 shadow-sm border border-gray-100">
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
      <Card className="mb-4 sm:mb-6 lg:mb-8 shadow-sm border border-gray-100">
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

const TierProgress = ({ tier, hasPlan }: { tier: { name: string; progress: number }; hasPlan: boolean }) => (
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
        {tier.name === 'Super Business' ? 'Unlimited Access' : hasPlan ? `${tier.progress}% of plan capacity used` : 'No active plan'}
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
