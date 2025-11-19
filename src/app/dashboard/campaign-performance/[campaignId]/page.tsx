"use client";

import { useParams } from "next/navigation";
import { useGetDetailedCampaignAnalytics } from "@/services/business-campaign/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DetailedCampaignAnalyticsPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const { data, isLoading, error } =
    useGetDetailedCampaignAnalytics(campaignId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-10 w-10 text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle />
          <span>Error loading detailed analytics: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center mt-12">No data available.</p>;
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Detailed Campaign Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.total_participants}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rewards Redeemed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.total_rewards_redeemed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Points Awarded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.total_points_awarded}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Redemption Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.redemption_rate}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.weekly_chart_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="points_awarded"
                  stroke="#8884d8"
                />
                <Line
                  type="monotone"
                  dataKey="rewards_redeemed"
                  stroke="#82ca9d"
                />
                <Line
                  type="monotone"
                  dataKey="new_participants"
                  stroke="#ffc658"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Redemptions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.ranked_participants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell className="text-right">
                        {p.total_points_earned}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.total_redemptions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Points Required</TableHead>
                    <TableHead className="text-right">Redemptions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_rewards.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>{r.points_required}</TableCell>
                      <TableCell className="text-right">
                        {r.total_redemptions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
