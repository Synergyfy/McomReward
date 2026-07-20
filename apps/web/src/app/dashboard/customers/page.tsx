"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetGeneralAnalytics } from "@/services/business-dashboard/hook";
import Loader from "@/components/ui/loader";

const ITEMS_PER_PAGE = 8;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: analytics, isLoading } = useGetGeneralAnalytics();

  const stats = useMemo(() => ({
    total: analytics?.totalCustomers ?? 0,
    avgSpend: analytics?.averageSpend ?? 0,
    avgPoints: analytics?.totalCustomers ? Math.round((analytics.totalPointsEarned || 0) / analytics.totalCustomers) : 0,
    avgPointsRedeemed: analytics?.totalCustomers ? Math.round((analytics.totalPointsRedeemed || 0) / analytics.totalCustomers) : 0,
  }), [analytics]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage your loyalty programme members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-[10px] sm:text-xs text-gray-500">Total Customers</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">£{stats.avgSpend}</p><p className="text-[10px] sm:text-xs text-gray-500">Avg. Spend (pts)</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.avgPoints.toLocaleString()}</p><p className="text-[10px] sm:text-xs text-gray-500">Avg. Points Earned</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.avgPointsRedeemed.toLocaleString()}</p><p className="text-[10px] sm:text-xs text-gray-500">Avg. Points Redeemed</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead className="text-right">Points Earned</TableHead>
                    <TableHead className="text-right">Points Redeemed</TableHead>
                    <TableHead className="text-right">Activities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.lastTenActivities && analytics.lastTenActivities.length > 0 ? (
                    analytics.lastTenActivities.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900 text-sm">{a.participant?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{a.participant?.email}</p>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {a.type === "EARN" ? a.points.toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {a.type === "REDEEM" ? a.points.toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-500">
                          <Badge variant="outline" className={a.type === "EARN" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                            {a.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-gray-500 text-sm">No customer activity data available yet.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {analytics?.lastTenActivities && analytics.lastTenActivities.length > 0 ? (
                analytics.lastTenActivities.map((a) => (
                  <div key={a.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{a.participant?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{a.participant?.email}</p>
                      </div>
                      <Badge variant="outline" className={a.type === "EARN" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {a.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {a.type === "EARN" ? "+" : "-"}{a.points} pts
                    </p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No customer activity data available yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
