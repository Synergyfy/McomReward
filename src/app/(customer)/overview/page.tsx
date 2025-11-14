"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Star, Bell, Gift } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const badgeProgress = 65; // mock progress (out of 100)
const totalPoints = 1240;
const matchingPoints = 300;
const level = "Gold";

const summaryData = [
  { label: "Campaigns Joined", value: 8 },
  { label: "Total Points Earned", value: 1240 },
  { label: "Total Redemptions", value: 3 },
];

const pointsChartData = [
  { name: "Jan", points: 200 },
  { name: "Feb", points: 400 },
  { name: "Mar", points: 300 },
  { name: "Apr", points: 500 },
  { name: "May", points: 700 },
  { name: "Jun", points: 600 },
];

const notifications = [
  { id: 1, message: "🎉 New campaign available from Glow Spa!" },
  { id: 2, message: "⭐ Your badge progress increased by 15%." },
  { id: 3, message: "🏆 Reward expiring soon: 20% off ABC Stores." },
];

export default function CustomerOverview() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ===== TOP SUMMARY ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Points Balance
            </CardTitle>
            <Coins className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{totalPoints}</div>
            <p className="text-xs text-gray-500">Total points earned</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Matching Points
            </CardTitle>
            <Gift className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{matchingPoints}</div>
            <p className="text-xs text-gray-500">Bonus from MCOM System</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Badge Level
            </CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-400 text-white">{level}</Badge>
              <span className="text-sm text-gray-500">({badgeProgress}%)</span>
            </div>
            <Progress value={badgeProgress} className="mt-2 bg-gray-200 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* ===== SUMMARY STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryData.map((item, idx) => (
          <Card key={idx} className="text-center shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== POINTS CHART ===== */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-700 text-sm font-medium">
            Points Activity (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#fb923c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ===== NOTIFICATIONS ===== */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-700 text-sm font-medium">
            Notifications
          </CardTitle>
          <Bell className="w-4 h-4 text-orange-500" />
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-lg bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
            >
              <span>{n.message}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
