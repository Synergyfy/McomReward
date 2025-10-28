import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Gift, Star } from 'lucide-react';
import { Wallet } from '@/lib/mock-data/wallet'; // Import the Wallet interface

interface PointsBalanceCardProps {
  wallet: Wallet;
}

export function PointsBalanceCard({ wallet }: PointsBalanceCardProps) {
  return (
    <Card className="shadow-xl rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold opacity-80 mb-2">Total Points Balance</h2>
        <div className="flex items-center mb-4">
          <Gift className="w-12 h-12 mr-4 opacity-90" />
          <span className="text-5xl font-bold tracking-tight">{wallet.totalPoints}</span>
        </div>
        <div className="flex justify-center gap-6 w-full">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{wallet.regularPoints}</span>
            <p className="text-sm opacity-80">Regular Points</p>
          </div>
          <div className="flex flex-col items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <span className="text-2xl font-bold">{wallet.matchingPoints}</span>
                  <Star className="w-4 h-4 ml-1 text-yellow-300" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Matching Points are bonus points added by MCOM.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm opacity-80">Matching Points</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
