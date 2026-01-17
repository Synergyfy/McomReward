'use client';

import React from 'react';
import { useGetCashbackBalance, useGetCashbackEvents, useGetCashbackHistory } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, Info, Loader2, History } from 'lucide-react';
import { format } from 'date-fns';

export default function CashbackPage() {
  const { data: balanceData, isLoading: isBalanceLoading } = useGetCashbackBalance();
  const { data: eventsData, isLoading: isEventsLoading } = useGetCashbackEvents();
  const { data: historyData, isLoading: isHistoryLoading } = useGetCashbackHistory();

  const isLoading = isBalanceLoading || isEventsLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Cashback Rewards</h1>
        <p className="text-muted-foreground">View your accumulated cashback and discover how to earn more.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Cashback</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">£{Number(balanceData?.balance || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Redeemable towards future purchases or services.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Recent cashback activities on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyData && historyData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.type ? item.type.replace(/_/g, ' ') : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={item.description}>
                      {item.description || '-'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${Number(item.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(item.amount) >= 0 ? '+' : ''}£{Number(item.amount).toFixed(2)}
                    </TableCell>
                     <TableCell className="text-right text-xs text-muted-foreground capitalize">
                      {item.status ? item.status.toLowerCase() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transaction history found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earning Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            How to Earn Cashback
          </CardTitle>
          <CardDescription>
            You can earn cashback rewards by performing the following actions on our platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsData && eventsData.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {eventsData.map((event) => (
                <div
                  key={event}
                  className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex items-start gap-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1 bg-blue-100 p-2 rounded-full">
                     <Coins className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{event.replace(/_/g, ' ')}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earn rewards when you complete this action.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No active cashback opportunities at the moment. Check back soon!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
