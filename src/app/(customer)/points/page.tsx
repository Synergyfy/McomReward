"use client";

import { useMemo } from "react";
import { DEMO_POINTS, DEMO_POINTS_TRANSACTIONS } from "@/app/(customer)/data/customerDemoData";
import { motion } from "framer-motion";
import { Info, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

export default function PointsPage() {
  const { totalPoints, matchingPoints, expiryDate } = DEMO_POINTS;

  const utilization = useMemo(() => {
    const spent = DEMO_POINTS_TRANSACTIONS.filter((t) => t.points < 0)
      .reduce((acc, t) => acc + Math.abs(t.points), 0);
    const earned = DEMO_POINTS_TRANSACTIONS.filter((t) => t.points > 0)
      .reduce((acc, t) => acc + t.points, 0);
    return Math.min((spent / earned) * 100, 100);
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">💰 Points & Matching Points</h2>
        <p className="text-gray-500 text-sm">
          Track your earned, redeemed, and matching points activity.
        </p>
      </div>

      {/* POINTS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Points */}
        <Card className="border-none shadow-md bg-gradient-to-br from-orange-100 to-orange-50">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Total Points</h3>
            <motion.span
              key={totalPoints}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-orange-600"
            >
              {totalPoints.toLocaleString()}
            </motion.span>
            <p className="text-xs text-gray-500">Active and available for redemption</p>
          </CardContent>
        </Card>

        {/* Matching Points */}
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-100 to-indigo-50">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-700">Matching Points</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white text-xs p-2 rounded-md">
                    Matching points are bonus points from the MCOM system and may have usage limits.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <motion.span
              key={matchingPoints}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-indigo-600"
            >
              {matchingPoints.toLocaleString()}
            </motion.span>
            <p className="text-xs text-gray-500">Valid until {expiryDate}</p>
          </CardContent>
        </Card>

        {/* Utilization */}
        <Card className="border-none shadow-md bg-gradient-to-br from-green-100 to-green-50">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Utilization</h3>
            <Progress value={utilization} className="w-24 h-2 bg-gray-200" />
            <p className="text-sm text-gray-600">{utilization.toFixed(1)}% of points used</p>
          </CardContent>
        </Card>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📜 Transaction History</h3>

        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Source</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_POINTS_TRANSACTIONS.map((tx) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: tx.id * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{tx.date}</td>
                  <td className="py-3 px-4">{tx.source}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    {tx.type === "Redeemed" ? (
                      <ArrowDownCircle className="text-red-500 w-4 h-4" />
                    ) : (
                      <ArrowUpCircle className="text-green-500 w-4 h-4" />
                    )}
                    {tx.type}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      tx.points > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : tx.points}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
