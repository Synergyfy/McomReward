'use client';

import React from 'react';
import { useGetCreditsRules, useGetCreditsHistory, useGetCreditsBalance } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  Users,
  Gift,
  Zap,
  Settings,
  ArrowRight,
  ChevronRight,
  History as HistoryIcon,
  Info,
  Sparkles,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function MerchantCreditsDashboard() {
  const { data: rulesData } = useGetCreditsRules();
  const { data: balanceData } = useGetCreditsBalance();
  const { data: historyData } = useGetCreditsHistory(1, 4);

  const chartData = [
    { month: 'Feb', issued: 0, redeemed: 0 },
    { month: 'Mar', issued: 0, redeemed: 0 },
    { month: 'Apr', issued: 0, redeemed: 0 },
    { month: 'May', issued: 0, redeemed: 0 },
    { month: 'Jun', issued: 0, redeemed: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-600 rounded-lg shadow-lg shadow-orange-200">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-slate-900">Credits & Rewards</h1>
          </div>
          <p className="text-slate-500 font-medium ml-11">Insights into your credit ecosystem and customer engagement levels.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button asChild variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 font-semibold px-6 h-11">
            <Link href="/dashboard/cashback/settings">
              <Settings className="w-4 h-4 mr-2 text-slate-500" />
              Configure Rules
            </Link>
          </Button>
          <Button className="font-semibold px-6 h-11 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all hover:scale-105 active:scale-95 text-white border-none">
            Export Analysis
          </Button>
        </motion.div>
      </div>

      {/* High Level Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Credits Balance"
          value={`${balanceData?.credits?.toLocaleString() ?? 0} CR`}
          subtext="Current Balance"
          icon={<Gift className="w-5 h-5 text-orange-600" />}
          color="orange"
          delay={0.1}
        />
        <StatCard
          title="Available Cashback"
          value={`£${balanceData?.availableCashback?.toFixed(2) ?? '0.00'}`}
          subtext="Claimable Amount"
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          color="emerald"
          delay={0.2}
        />
        <StatCard
          title="Pending Amount"
          value={`£${balanceData?.pendingAmount?.toFixed(2) ?? '0.00'}`}
          subtext="Awaiting settlement"
          icon={<Zap className="w-5 h-5 text-amber-500 fill-amber-500" />}
          color="amber"
          delay={0.3}
        />
        <StatCard
          title="Expiring Soon"
          value={`£${balanceData?.expiringSoon?.toFixed(2) ?? '0.00'}`}
          subtext="Reward participants"
          icon={<Users className="w-5 h-5 text-orange-600" />}
          color="orange"
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Issuance vs Redemption Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-none shadow-2xl bg-white overflow-hidden p-2">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Earning Velocity</CardTitle>
                  <CardDescription className="text-sm font-medium">Monthly comparison of credits issued vs converted rewards.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 font-semibold">Last 5 Months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] md:h-[350px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRedeemed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="issued" stroke="#ea580c" strokeWidth={4} fillOpacity={1} fill="url(#colorIssued)" name="Credits Issued (CR)" />
                    <Area type="monotone" dataKey="redeemed" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRedeemed)" name="Converted (£)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info & Rule Summary */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-none shadow-2xl bg-orange-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-24 h-24 rotate-12" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-orange-100 flex items-center gap-2">
                  Matching Contribution <ArrowUpRight className="w-3 h-3" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold">Shared Value Model</h3>
                <p className="mt-4 text-sm font-medium text-orange-100 leading-relaxed">
                  The current "Credits" system encourages users to contribute real money to unlock rewards, maintaining a healthy <span className="text-white font-semibold underline decoration-white-400 decoration-2 underline-offset-4">1:2 Platform Match</span>.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold bg-white/10 p-2 rounded-lg border border-white/20">
                  <Info className="w-4 h-4 text-orange-100" />
                  AI Insight: Level 2 conversion is trending up.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                  <Activity className="w-4 h-4" /> Top Earning Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rulesData?.filter(r => r.isActive).slice(0, 3).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-orange-200 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 uppercase leading-none">{rule.eventType.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Active Rule</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-orange-600">
                        {rule.rewardType === 'PERCENTAGE' ? `${rule.rewardValue}%` : `+${rule.rewardValue} CR`}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-[10px] text-slate-400 font-bold italic text-center">
                  * Credits are converted via matching contribution.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                <HistoryIcon className="w-6 h-6 text-orange-500" />
                Global Earning Stream
              </CardTitle>
              <CardDescription className="text-sm font-medium">Real-time feed of credit accumulation and reward conversions.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="font-semibold text-xs px-4 h-9">
              View Audit Logs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {historyData?.data.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all border-l-4 border-transparent hover:border-orange-500 group">
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-2xl shadow-sm ${Number(item.amount ?? 0) >= 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'} group-hover:scale-110 transition-transform`}>
                      {Number(item.amount ?? 0) >= 0 ? <Gift className="w-5 h-5" /> : <HistoryIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.createdAt.split('T')[0]}</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">Status: {item.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-semibold ${Number(item.amount ?? 0) >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {Number(item.amount ?? 0) >= 0 ? '+' : ''}{item.unit === 'GBP' ? '£' : ''}{Math.abs(Number(item.amount ?? 0)).toFixed(2)}{item.unit === 'CREDITS' ? ' CR' : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Platform Activity</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, subtext, icon, color, delay }: any) {
  const colorMap: any = {
    orange: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 shadow-lg ${colorMap[color]}`}>
              {icon}
            </div>
            <div className="bg-slate-50 text-[10px] font-semibold text-slate-400 px-2 py-1 rounded-full uppercase tracking-tighter">
              Realtime
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-2 tracking-tighter">{value}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-tight">{subtext}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
