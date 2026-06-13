'use client';

import React, { useState } from 'react';
import { useGetCreditsBalance, useGetCreditsHistory } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  History,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParticipantWalletPage() {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: balanceData, isLoading: isBalanceLoading } = useGetCreditsBalance();
  const { data: historyData, isLoading: isHistoryLoading } = useGetCreditsHistory(page, limit);

  const historyItems = historyData?.data || [];
  const meta = historyData?.meta;
  const totalPages = meta?.totalPages || 1;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge variant="secondary" className="bg-green-100/80 text-green-700 hover:bg-green-100 border-green-200">Available</Badge>;
      case 'REDEEMED': return <Badge variant="outline" className="text-slate-400 border-slate-200">Redeemed</Badge>;
      case 'EXPIRING_SOON': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Expiring</Badge>;
      case 'EXPIRED': return <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100">Expired</Badge>;
      default: return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            My Wallet <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
          </h1>
          <p className="text-slate-500 font-medium">Manage your claimed credits and spendable currency.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-slate-600">Verified Wallet Balance</span>
        </div>
      </motion.div>

      {/* Hero Balance Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card className="border-none bg-orange-600 text-white shadow-2xl relative overflow-hidden h-full min-h-[220px]">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            </div>

            <CardContent className="p-8 relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="p-3 bg-white/20 backdrop-blur-md rounded-2xl cursor-default"
                >
                  <Wallet className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-right">
                  <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest opacity-80">Claimed Balance</p>
                  <h2 className="text-5xl font-semibold mt-1">£{(balanceData?.availableCashback ?? 0).toFixed(2)}</h2>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <p className="text-[10px] font-semibold text-orange-100 uppercase opacity-80">Pending Claims</p>
                  <p className="text-xl font-semibold">£{(balanceData?.pendingAmount ?? 0).toFixed(2)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <p className="text-[10px] font-semibold text-orange-100 uppercase opacity-80">Expiring Currency</p>
                  <p className="text-xl font-semibold">£{(balanceData?.expiringSoon ?? 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-xl h-full bg-white overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-500 uppercase tracking-tighter">
                <Clock className="w-4 h-4" /> Credits Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-grow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Unclaimed Credits</span>
                    <span>{balanceData?.credits ?? 0} CR</span>
                  </div>
                  <Progress value={((balanceData?.credits ?? 0) / (balanceData?.progression.nextLevel?.creditsNeeded ?? 50)) * 100} className="h-2 bg-slate-100" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  You have {balanceData?.credits ?? 0} credits waiting to be unlocked. Reaching your next level will allow you to claim £50 in rewards!
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-orange-600 bg-orange-50/50 p-3 rounded-xl border border-orange-50">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p className="text-[10px] font-semibold leading-tight">
                    Visit the Credits page to contribute and unlock your unclaimed rewards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                <History className="w-5 h-5 text-orange-500" />
                Wallet Activity
              </CardTitle>
              <CardDescription className="text-xs font-medium">Log of your redemptions and claimed credit history.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="icon" className="h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline" size="icon" className="h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isHistoryLoading ? (
                  <div key="loading" className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : (
                  <div key="list">
                    {historyItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-indigo-50/30 transition-all cursor-default"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${Number(item.amount ?? 0) >= 0 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'} group-hover:scale-110 transition-transform shadow-sm`}>
                            {Number(item.amount ?? 0) >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{item.createdAt.split('T')[0]}</span>
                              <span className="text-slate-200">|</span>
                              <span className="text-[10px] font-semibold text-orange-500 uppercase">{item.unit === 'CREDITS' ? 'CREDIT EARNING' : 'WALLET TRANSACTION'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4 md:mt-0 text-right">
                          <div className="hidden lg:block text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</p>
                            <div className="mt-1">{getStatusBadge(item.status)}</div>
                          </div>
                          <div className="min-w-[100px]">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Value</p>
                            <p className={`text-xl font-semibold mt-1 ${Number(item.amount ?? 0) >= 0 ? 'text-green-600' : 'text-slate-900'}`}>
                              {Number(item.amount ?? 0) >= 0 ? '+' : ''}{item.unit === 'GBP' ? '£' : ''}{Math.abs(Number(item.amount ?? 0)).toFixed(2)}{item.unit === 'CREDITS' ? ' CR' : ''}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {historyItems.length === 0 && (
                      <div className="p-20 text-center">
                        <div className="p-4 bg-slate-50 rounded-full inline-block mb-4">
                          <Clock className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-semibold">No activity found yet.</p>
                        <Button variant="link" className="text-orange-600 mt-2">Start earning credits</Button>
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Page {page} of {totalPages}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
