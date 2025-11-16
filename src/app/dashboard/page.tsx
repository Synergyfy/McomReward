"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend} from "recharts";
import { Users, Gift, Trophy, Percent, Megaphone, Flame, Star, ArrowDown, ArrowUp } from "lucide-react";
import { seasonalMockData } from "../mock-data";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";
type Season = "Summer" | "Winter" | "Autumn" | "Spring";

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

const seasonOptions: { value: Season; label: string }[] = [
    { value: "Summer", label: "Summer" },
    { value: "Winter", label: "Winter" },
    { value: "Autumn", label: "Autumn" },
    { value: "Spring", label: "Spring" },
];

const getCurrentSeason = (): Season => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Autumn";
    if (month >= 11 || month <= 1) return "Winter";
    return "Spring";
};

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedSeason, setSelectedSeason] = useState<Season>(getCurrentSeason());

  const data = seasonalMockData[selectedSeason];
  const selectedTimeRangeLabel = timeRangeOptions.find(option => option.value === timeRange)?.label;

  return (
    <div className="min-h-screen bg-white p-8">
     <div className="flex justify-between items-center mb-8">
        <div></div>
        <Select value={selectedSeason} onValueChange={(value) => setSelectedSeason(value as Season)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
                {seasonOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      {/* === Overview Stats === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Customers" value={data.totalCustomers} icon={<Users className="text-orange-500" />} />
        <StatCard title="Rewards Redeemed" value={data.totalRewardsRedeemed} icon={<Gift className="text-orange-500" />} />
        <StatCard title="Total Campaigns" value={data.totalCampaigns} icon={<Megaphone className="text-orange-500" />} />
        <StatCard title="Top Deal" value={data.topDeal} icon={<Flame className="text-orange-500" />} />
        <StatCard title="Redemption Rate" value={`${data.redemptionRate}%`} icon={<Percent className="text-orange-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <TierProgress tier={data.tier} />
        <PointsSummary summary={data.pointsSummary} />
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.performanceData[timeRange]}>
              <XAxis dataKey="name" stroke="#888" />
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
              <Bar dataKey="earned" name="Points Earned" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="redeemed" name="Points Redeemed" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* === Active Campaigns === */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.activeCampaigns.map((c) => (
              <li key={c.id} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-800">{c.name}</span>
                <span className="text-sm text-orange-600">{c.customers} customers</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* === Recent Activity === */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recentActivity.map((a) => (
              <li key={a.id} className="flex justify-between text-sm text-gray-700">
                <span>{a.type} — <b>{a.customer}</b></span>
                <span className="text-orange-600">+{a.points} pts</span>
              </li>
            ))}
          </ul>
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
