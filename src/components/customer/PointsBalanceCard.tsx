import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { mockCustomerData } from '@/lib/mock-data/customer';
import { motion } from "framer-motion";
import { Progress } from '../ui/progress';
import { mockWallet } from '@/lib/mock-data/wallet';
import { useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';

export function PointsBalanceCard() {

  const { data: balanceData, isLoading } = useGetParticipantGlobalBalance();

  const totalPoints = balanceData?.globalTotalPoints || 0;
  const matchingPoints = balanceData?.matchingPoints || 0;
  const expiryDate = "2025-12-31";

  const utilization = useMemo(() => {
    const spent = mockWallet.transactions.filter((t) => t.points < 0)
      .reduce((acc, t) => acc + Math.abs(t.points), 0);
    const earned = mockWallet.transactions.filter((t) => t.points > 0)
      .reduce((acc, t) => acc + t.points, 0);
    return Math.min((spent / earned) * 100, 100);
  }, []);

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center shadow-xl rounded-2xl overflow-hidden text-white h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-center shadow-xl rounded-2xl overflow-hidden text-white ">


      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        {/* new copy */}
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

        {/* new copy ends */}
      </CardContent>
      <div className=" px-6 py-3 text-lg text-left italic opacity-90 w-30 flex ">
        {mockCustomerData.customerBadge} Member
      </div>
    </Card>
  );
}
