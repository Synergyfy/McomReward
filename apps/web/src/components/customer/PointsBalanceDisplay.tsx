import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { motion } from "framer-motion";
import { Progress } from '../ui/progress';

interface PointsBalanceDisplayProps {
  totalPoints: number;
  matchingPoints: number;
  totalStamps: number;
  utilization: number;
  badgeLevel: string;
  isLoading: boolean;
  expiryDate?: string;
}

export function PointsBalanceDisplay({
  totalPoints,
  matchingPoints,
  totalStamps,
  utilization,
  badgeLevel,
  isLoading,
  expiryDate = "2025-12-31"
}: PointsBalanceDisplayProps) {

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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Total Points */}
          <Card className="border-none shadow-md bg-gradient-to-br from-orange-100 to-orange-50">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Total Points</h3>
              <motion.span
                key={totalPoints}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-orange-600"
              >
                {totalPoints.toLocaleString()}
              </motion.span>
              <p className="text-[10px] text-gray-500">Active and available</p>
            </CardContent>
          </Card>

          {/* Total Stamps */}
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-100 to-blue-50">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Total Stamps</h3>
              <motion.span
                key={totalStamps}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-blue-600"
              >
                {totalStamps.toLocaleString()}
              </motion.span>
              <p className="text-[10px] text-gray-500">Earned from campaigns</p>
            </CardContent>
          </Card>

          {/* Matching Points */}
          <Card className="border-none shadow-md bg-gradient-to-br from-indigo-100 to-indigo-50">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-semibold text-gray-700">Matching Points</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white text-[10px] p-2 rounded-md">
                      Matching points are bonus points from the MCOM system and may have usage limits.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <motion.span
                key={matchingPoints}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-indigo-600"
              >
                {matchingPoints.toLocaleString()}
              </motion.span>
              <p className="text-[10px] text-gray-500">Until {expiryDate}</p>
            </CardContent>
          </Card>

          {/* Utilization */}
          <Card className="border-none shadow-md bg-gradient-to-br from-green-100 to-green-50">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Utilization</h3>
              <Progress value={utilization} className="w-20 h-2 bg-gray-200" />
              <p className="text-xs text-gray-600">{utilization.toFixed(1)}% used</p>
            </CardContent>
          </Card>
        </div>

      </CardContent>
      <div className=" px-6 py-3 text-lg text-left italic opacity-90 w-30 flex ">
        {badgeLevel} Member
      </div>
    </Card>
  );
}
