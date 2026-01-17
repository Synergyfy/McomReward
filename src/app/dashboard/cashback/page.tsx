'use client';

import React, { useState } from 'react';
import { useGetCashbackBalance, useGetCashbackEvents, useGetCashbackHistory, useGetCashbackRules } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Coins, Info, Loader2, History, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { format } from 'date-fns';

export default function CashbackPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: balanceData, isLoading: isBalanceLoading } = useGetCashbackBalance();
  const { data: eventsData, isLoading: isEventsLoading } = useGetCashbackEvents();
  const { data: historyData, isLoading: isHistoryLoading } = useGetCashbackHistory(page, limit);
  const { data: rulesData, isLoading: isRulesLoading } = useGetCashbackRules();

  const isLoading = isBalanceLoading || isEventsLoading || isHistoryLoading || isRulesLoading;

  // History Pagination Helpers
  const historyItems = historyData?.data || [];
  const meta = historyData?.meta;
  const totalPages = meta?.totalPages || 1;

  if (isLoading && page === 1) { // Only show full loader on initial load
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
        <p className="text-muted-foreground">View your accumulated cashback, transaction history, and active rules.</p>
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

      {/* Active Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-600" />
            Active Cashback Rules
          </CardTitle>
          <CardDescription>
            Current rates and rewards configured for the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rulesData && rulesData.length > 0 ? (
            <Table>
               <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Platform</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesData.filter(r => r.isActive).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.eventType}</TableCell>
                    <TableCell>
                      {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `£${Number(rule.rewardValue).toFixed(2)}`}
                    </TableCell>
                     <TableCell className="text-muted-foreground text-sm">
                      {rule.platform === 'MCOM_LOYALTY' ? 'Loyalty' : 'Mall'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No active cashback rules found.
            </div>
          )}
        </CardContent>
      </Card>

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
          {historyItems.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.eventType || item.type || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.sourcePlatform === 'MCOM_LOYALTY' ? 'Loyalty' : (item.sourcePlatform === 'MCOM_MALL' ? 'Mall' : '-')}
                      </TableCell>
                      <TableCell className={`text-right font-medium text-sm ${Number(item.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(item.amount) >= 0 ? '+' : ''}£{Number(item.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isHistoryLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isHistoryLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transaction history found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earning Opportunities (Static/Events List) */}
      <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Info className="w-5 h-5 text-blue-600" />
             Supported Events
           </CardTitle>
           <CardDescription>
             Actions that are supported by the platform for rewards.
           </CardDescription>
         </CardHeader>
         <CardContent>
            {eventsData && eventsData.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {eventsData.map(event => (
                  <div key={event} className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium text-secondary-foreground border border-secondary">
                    {event}
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-sm text-muted-foreground">No events listed.</p>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
