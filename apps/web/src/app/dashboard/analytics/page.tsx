"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Percent,
  DollarSign,
  Gift,
  Award,
  Users,
  Star,
  Zap,
} from "lucide-react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const MOCK_KPIS = {
  repeatCustomerRate: 68.5,
  redemptionRate: 42.3,
  averageSpend: 36.75,
  customerLtv: 284.50,
};

const MOCK_GROWTH = [
  { month: "Jan", customers: 120 },
  { month: "Feb", customers: 145 },
  { month: "Mar", customers: 168 },
  { month: "Apr", customers: 195 },
  { month: "May", customers: 212 },
  { month: "Jun", customers: 238 },
  { month: "Jul", customers: 247 },
];

const MOCK_TOP_REWARDS = [
  { name: "Free Coffee", redemptions: 312, percentage: 28 },
  { name: "10% Off Voucher", redemptions: 245, percentage: 22 },
  { name: "£5 Credit", redemptions: 189, percentage: 17 },
  { name: "Free Dessert", redemptions: 156, percentage: 14 },
  { name: "Birthday Treat", redemptions: 98, percentage: 9 },
];

const MOCK_TOP_CAMPAIGNS = [
  { name: "Summer Dining Campaign", roi: 340, reach: 1200, conversions: 186 },
  { name: "New Customer Campaign", roi: 280, reach: 890, conversions: 142 },
  { name: "Birthday Campaign", roi: 195, reach: 560, conversions: 98 },
  { name: "Referral Programme", roi: 420, reach: 340, conversions: 164 },
  { name: "Weekend Special", roi: 160, reach: 720, conversions: 87 },
];

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
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
            value={`${MOCK_KPIS.repeatCustomerRate}%`}
            trend={{ value: 5.2, isUp: true }}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <MetricCard
            icon={Zap}
            label="Redemption Rate"
            value={`${MOCK_KPIS.redemptionRate}%`}
            trend={{ value: 2.1, isUp: true }}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <MetricCard
            icon={DollarSign}
            label="Average Customer Spend"
            value={`£${MOCK_KPIS.averageSpend}`}
            trend={{ value: 1.8, isUp: false }}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <MetricCard
            icon={TrendingUp}
            label="Customer Lifetime Value"
            value={`£${MOCK_KPIS.customerLtv}`}
            trend={{ value: 12.3, isUp: true }}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Customer Growth Chart */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Customer Growth Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MOCK_GROWTH}>
                <XAxis dataKey="month" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #f97316" }}
                  cursor={{ stroke: "#f97316", strokeDasharray: "4 4" }}
                />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: "#f97316", stroke: "white", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
              <div className="space-y-3">
                {MOCK_TOP_REWARDS.map((reward, i) => (
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
            </CardContent>
          </Card>

          {/* Best Performing Campaign */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-base sm:text-lg">Best Performing Campaigns</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-6">
              <div className="space-y-3">
                {MOCK_TOP_CAMPAIGNS.map((camp, i) => (
                  <div key={camp.name} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                        i === 0 ? "bg-orange-500" : i === 1 ? "bg-gray-500" : i === 2 ? "bg-amber-600" : "bg-gray-400"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                        <p className="text-[10px] text-gray-500">{camp.reach} reached · {camp.conversions} conversions</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold flex-shrink-0 ml-2 ${
                      i === 0 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"
                    }`}>
                      {camp.roi}% ROI
                    </Badge>
                  </div>
                ))}
              </div>
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
  trend,
  bgColor,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: { value: number; isUp: boolean };
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
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.isUp ? (
              <ArrowUp className="w-3 h-3 text-green-500" />
            ) : (
              <ArrowDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-[10px] sm:text-xs font-medium ${trend.isUp ? "text-green-600" : "text-red-600"}`}>
              {trend.value}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
