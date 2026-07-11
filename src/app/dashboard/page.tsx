"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Gift, Megaphone, Flame, Percent, Star, ArrowUp, ArrowDown, Plus, Minus, Stamp, Wallet, Eye, Coins, Ticket, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetGeneralAnalytics, useGetChartData } from "@/services/business-dashboard/hook";
import { useGetMySubscription } from '@/services/tiers/hook';
import { useGetBusinessProfile } from "@/services/business/hook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

// ─── MOCK DATA ────────────────────────────────────────────────────────────

const MOCK_ANALYTICS = {
  totalCustomers: 247,
  totalCampaigns: 3,
  totalActiveCampaigns: 3,
  totalRewardsRedeemed: 89,
  totalPointsEarned: 15240,
  totalPointsRedeemed: 4730,
  activeCampaigns: [
    { name: "New Customer Campaign", customerCount: 86 },
    { name: "Summer Dining Campaign", customerCount: 54 },
    { name: "Birthday Campaign", customerCount: 23 },
  ],
  lastTenActivities: [
    { id: "1", createdAt: "2026-07-08T14:30:00Z", updatedAt: "", deletedAt: null, type: "EARN" as const, points: 50, redemptionCode: null, description: "Purchase at restaurant", participant: { id: "p1", name: "Sarah Johnson", email: "sarah@email.com" }, campaign: { id: "c1", name: "Summer Dining" } },
    { id: "2", createdAt: "2026-07-08T12:15:00Z", updatedAt: "", deletedAt: null, type: "REDEEM" as const, points: 200, redemptionCode: "RDM-001", description: "Free dessert voucher", participant: { id: "p2", name: "Mike Peters", email: "mike@email.com" }, campaign: { id: "c2", name: "Birthday Campaign" } },
    { id: "3", createdAt: "2026-07-07T18:45:00Z", updatedAt: "", deletedAt: null, type: "EARN" as const, points: 100, redemptionCode: null, description: "Referral bonus", participant: { id: "p3", name: "Emma Wilson", email: "emma@email.com" }, campaign: { id: "c1", name: "Summer Dining" } },
    { id: "4", createdAt: "2026-07-07T09:30:00Z", updatedAt: "", deletedAt: null, type: "EARN" as const, points: 30, redemptionCode: null, description: "Coffee purchase", participant: { id: "p4", name: "James Brown", email: "james@email.com" }, campaign: { id: "c3", name: "New Customer" } },
    { id: "5", createdAt: "2026-07-06T16:00:00Z", updatedAt: "", deletedAt: null, type: "REDEEM" as const, points: 150, redemptionCode: "RDM-002", description: "Birthday reward", participant: { id: "p5", name: "Lisa Chen", email: "lisa@email.com" }, campaign: { id: "c2", name: "Birthday Campaign" } },
  ],
};

const MOCK_CHART_DATA = {
  data: [
    { date: "Jul 1", pointsEarned: 520, pointsRedeemed: 180 },
    { date: "Jul 2", pointsEarned: 480, pointsRedeemed: 120 },
    { date: "Jul 3", pointsEarned: 610, pointsRedeemed: 250 },
    { date: "Jul 4", pointsEarned: 390, pointsRedeemed: 90 },
    { date: "Jul 5", pointsEarned: 720, pointsRedeemed: 310 },
    { date: "Jul 6", pointsEarned: 550, pointsRedeemed: 200 },
    { date: "Jul 7", pointsEarned: 680, pointsRedeemed: 280 },
  ],
};

const MOCK_METRICS = {
  activeMembers: 247,
  pointsIssued: 15240,
  pointsRedeemed: 4730,
  stampProgress: 68,
  voucherUsage: 42,
  giftCardBalances: 3850,
};

// ─── CUSTOMER WALLET PREVIEW ──────────────────────────────────────────────

function CustomerWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-orange-500" />Customer Wallet Preview</DialogTitle>
          <DialogDescription>This is how your reward programme appears to customers.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Points</p>
                  <p className="text-3xl font-bold text-orange-600">1,250</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <Progress value={42} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">42% towards next reward (3,000 points)</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Stamp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-900">Stamp Card</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < 3 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {i < 3 ? "✓" : "○"}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">3/5 stamps — buy 5 get 1 free</p>
              </CardContent>
            </Card>
            <Card className="border-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-900">Vouchers</span>
                </div>
                <p className="text-lg font-bold text-orange-600">2</p>
                <p className="text-xs text-gray-500">Free dessert • £5 off</p>
              </CardContent>
            </Card>
            <Card className="border-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-900">Gift Cards</span>
                </div>
                <p className="text-lg font-bold text-orange-600">£25.00</p>
                <p className="text-xs text-gray-500">1 active gift card</p>
              </CardContent>
            </Card>
            <Card className="border-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-900">Matching Pts</span>
                </div>
                <p className="text-lg font-bold text-orange-600">500</p>
                <p className="text-xs text-gray-500">Matching points available</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { desc: "Purchase at restaurant", points: "+50", type: "earn" },
                { desc: "Free dessert redeemed", points: "-200", type: "redeem" },
                { desc: "Referral bonus", points: "+100", type: "earn" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{t.desc}</span>
                  <span className={`text-sm font-semibold ${t.type === "earn" ? "text-green-600" : "text-red-600"}`}>{t.points}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [walletPreviewOpen, setWalletPreviewOpen] = useState(false);

  const { data: analyticsData, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useGetGeneralAnalytics();
  const { data: chartData, isLoading: isChartLoading, isError: isChartError } = useGetChartData({ period: timeRange });
  const { data: subscription, isLoading: isLoadingSubscription } = useGetMySubscription();
  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();

  const selectedTimeRangeLabel = timeRangeOptions.find(option => option.value === timeRange)?.label;

  // Use real data if available, otherwise fall back to mock
  const displayData = useMemo(() => {
    if (analyticsData && !isAnalyticsError) return analyticsData;
    return MOCK_ANALYTICS;
  }, [analyticsData, isAnalyticsError]);

  const displayChart = useMemo(() => {
    if (chartData && !isChartError) return chartData;
    return MOCK_CHART_DATA;
  }, [chartData, isChartError]);

  const displayMetrics = useMemo(() => MOCK_METRICS, []);

  const isSuperBusiness = profile?.isSuperBusiness;
  const tierName = isSuperBusiness ? 'Super Business' : (subscription?.tier?.name || 'Starter');
  const tierProgress = isSuperBusiness ? 100 : ((subscription?.tier as any)?.progress || 35);

  if (isAnalyticsLoading || isLoadingSubscription || isProfileLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Phase 12: Metrics Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-sm text-gray-500">Your loyalty programme at a glance</p>
        </div>
        <Button variant="outline" onClick={() => setWalletPreviewOpen(true)} className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50">
          <Eye className="w-4 h-4" />Customer Wallet Preview
        </Button>
      </div>

      {/* Phase 12: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl"><Users className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayMetrics.activeMembers}</p><p className="text-xs text-gray-500">Active Members</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl"><ArrowUp className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayMetrics.pointsIssued.toLocaleString()}</p><p className="text-xs text-gray-500">Points Issued</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl"><ArrowDown className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayMetrics.pointsRedeemed.toLocaleString()}</p><p className="text-xs text-gray-500">Points Redeemed</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl"><Gift className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">£{displayMetrics.giftCardBalances.toLocaleString()}</p><p className="text-xs text-gray-500">Gift Card Balances</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl"><Gift className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayData.totalRewardsRedeemed}</p><p className="text-xs text-gray-500">Rewards Redeemed</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl"><Megaphone className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayData.totalCampaigns}</p><p className="text-xs text-gray-500">Total Campaigns</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl"><Flame className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayData.totalActiveCampaigns}</p><p className="text-xs text-gray-500">Active Campaigns</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl"><Stamp className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{displayMetrics.stampProgress}%</p><p className="text-xs text-gray-500">Stamp Progress</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <TierProgress tier={{ name: tierName, progress: tierProgress }} />
        <PointsSummary
          summary={{ earned: displayData.totalPointsEarned, spent: displayData.totalPointsRedeemed, matchingAvailable: 5000 }}
          isTrial={subscription?.isTrial}
          trialQuota={subscription?.tier?.configuration?.quotas?.monthlyPointsAllowance}
        />
      </div>

      {/* Chart */}
      <Card className="mb-8 shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance ({selectedTimeRangeLabel})</CardTitle>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayChart.data}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #f97316" }} cursor={{ fill: "#fff7ed" }} />
              <Legend />
              <Bar dataKey="pointsEarned" name="Points Earned" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pointsRedeemed" name="Points Redeemed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="mb-8 shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {displayData.activeCampaigns && displayData.activeCampaigns.length > 0 ? (
            <div className="space-y-3">
              {displayData.activeCampaigns.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                  <span className="font-medium text-gray-800">{c.name}</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-300 bg-white">{c.customerCount} customers</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active campaigns.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {displayData.lastTenActivities && displayData.lastTenActivities.length > 0 ? (
            <ul className="space-y-4">
              {displayData.lastTenActivities.map((a) => (
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

      {/* Phase 11: Customer Wallet Modal */}
      <CustomerWalletModal isOpen={walletPreviewOpen} onClose={() => setWalletPreviewOpen(false)} />
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
      <p className="text-sm text-gray-500 mt-2">
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
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">Trial Limit Active</div>
        <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2">Trial Points{isExhausted && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">Exhausted</span>}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div><p className="text-sm text-gray-500">Allocated</p><p className="text-2xl font-bold text-indigo-600">{(trialQuota || 0).toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-500">Used</p><p className="text-2xl font-bold text-orange-600">{summary.spent.toLocaleString()}</p></div>
          <div><p className="text-sm text-gray-500">Remaining</p><p className={`text-2xl font-bold ${remaining > 0 ? 'text-green-600' : 'text-gray-400'}`}>{Math.max(0, remaining).toLocaleString()}</p></div>
          {isExhausted && <div className="col-span-1 sm:col-span-3 mt-2"><a href="/dashboard/subscription" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">Upgrade to continue</a></div>}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-md border-none bg-white lg:col-span-2">
      <CardHeader><CardTitle className="text-lg font-semibold">Points Summary</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div><p className="text-sm text-gray-500">Earned</p><p className="text-2xl font-bold text-green-600"><ArrowUp size={20} className="inline" /> {summary.earned.toLocaleString()}</p></div>
        <div><p className="text-sm text-gray-500">Spent</p><p className="text-2xl font-bold text-red-600"><ArrowDown size={20} className="inline" /> {summary.spent.toLocaleString()}</p></div>
        <div><p className="text-sm text-gray-500">Matching Available</p><p className="text-2xl font-bold text-orange-600">{summary.matchingAvailable.toLocaleString()}</p></div>
      </CardContent>
    </Card>
  );
};
