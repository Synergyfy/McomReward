"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend} from "recharts";
import { Users, Gift, Trophy, Percent } from "lucide-react";
import { motion } from "framer-motion";


const mockBusinessData = {
  businessName: "Cafe Delights",
  totalCustomers: 12840,
  totalPointsAwarded: 542300,
  totalRewardsRedeemed: 3120,
  redemptionRate: 24.3,
  activeCampaigns: [
    { id: "cmp001", name: "Summer Loyalty Campaign 2025", status: "Active", customers: 1284 },
    { id: "cmp004", name: "Tech Fest 2025 Loyalty Program", status: "Active", customers: 760 },
    { id: "cmp005", name: "Fitness Rewards Challenge", status: "Active", customers: 560 },
  ],
  weeklyTrend: [
    { week: "Oct 1", earned: 8400, redeemed: 3200 },
    { week: "Oct 2", earned: 7200, redeemed: 2900 },
    { week: "Oct 3", earned: 11000, redeemed: 4300 },
    { week: "Oct 4", earned: 9700, redeemed: 3800 },
    { week: "Oct 5", earned: 8600, redeemed: 3100 },
    { week: "Oct 6", earned: 9100, redeemed: 3500 },
    { week: "Oct 7", earned: 10200, redeemed: 3900 },
  ],
  recentActivity: [
    { id: 1, type: "Reward Redeemed", customer: "Sarah Johnson", points: 500 },
    { id: 2, type: "New Signup", customer: "Kwame Mensah", points: 200 },
    { id: 3, type: "Reward Redeemed", customer: "Linda Ofori", points: 800 },
  ],
};

export default function BusinessDashboard() {
  const [data] = useState(mockBusinessData);

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-semibold text-gray-800 mb-6"
      >
        {data.businessName} Business Dashboard
      </motion.h1>

      {/* === Overview Stats === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Customers" value={data.totalCustomers} icon={<Users className="text-orange-500" />} />
        <StatCard title="Points Awarded" value={data.totalPointsAwarded.toLocaleString()} icon={<Trophy className="text-orange-500" />} />
        <StatCard title="Rewards Redeemed" value={data.totalRewardsRedeemed} icon={<Gift className="text-orange-500" />} />
        <StatCard title="Redemption Rate" value={`${data.redemptionRate}%`} icon={<Percent className="text-orange-500" />} />
      </div>

      {/* === Chart Section === */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Points Earned vs Redeemed (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
           <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weeklyTrend}>
              <XAxis dataKey="week" stroke="#888" />
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
