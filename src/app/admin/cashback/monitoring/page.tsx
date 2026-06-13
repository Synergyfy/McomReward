'use client';

import React, { useState } from 'react';
import { useGetAdminCreditsHistory } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    History as HistoryIcon,
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    Download,
    Filter,
    Activity,
    User,
    ExternalLink,
    ShieldCheck,
    TrendingUp,
    Clock,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCreditsMonitoringPage() {
    const [page, setPage] = useState(1);
    const [searchEmail, setSearchEmail] = useState('');
    const limit = 10;

    const { data: historyData, isLoading } = useGetAdminCreditsHistory(page, limit, searchEmail);

    const historyItems = historyData?.data || [];
    const meta = historyData?.meta;
    const totalPages = meta?.totalPages || 1;

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'AVAILABLE': return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[9px]">Available</Badge>;
            case 'REDEEMED': return <Badge variant="outline" className="text-slate-400 border-slate-100 font-bold uppercase text-[9px]">Redeemed</Badge>;
            case 'EXPIRING_SOON': return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 font-bold uppercase text-[9px]">Expiring</Badge>;
            case 'EXPIRED': return <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 font-bold uppercase text-[9px]">Expired</Badge>;
            default: return <Badge variant="outline" className="font-bold uppercase text-[9px]">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Platform Monitoring</h1>
                            <p className="text-slate-500 font-medium">Real-time global audit logs for credits, matching contributions, and wallet events.</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="bg-white border-slate-200 font-bold h-11 px-6 shadow-sm">
                        <Download className="w-4 h-4 mr-2 text-indigo-600" /> Export CSV
                    </Button>
                    <Button variant="destructive" className="font-bold h-11 px-6 shadow-xl shadow-red-100 hover:scale-105 active:scale-95 transition-all">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Fraud Alerts
                    </Button>
                </motion.div>
            </div>

            {/* Quick Audit Metrics */}
            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-4">
                <AdminStatCard title="System Uptime" value="99.99%" icon={<Activity className="w-4 h-4" />} trend="+0.01%" />
                <AdminStatCard title="Daily Credits" value="12,405 CR" icon={<Zap className="w-4 h-4" />} trend="+12.5%" />
                <AdminStatCard title="Active Wallets" value="24,842" icon={<User className="w-4 h-4" />} trend="+142 today" />
                <AdminStatCard title="Total Match" value="£8,420.00" icon={<TrendingUp className="w-4 h-4" />} trend="£120.40 today" />
            </div>

            <Card className="border-none shadow-2xl bg-white overflow-hidden">
                <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <HistoryIcon className="w-6 h-6 text-slate-400" /> Audit Ledger
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">Immutible record of platform financial triggers and credit events.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Filter by user email..."
                                    className="pl-10 w-[300px] h-10 border-slate-200 focus-visible:ring-indigo-500 font-medium"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="w-[180px] font-black text-slate-400 text-[11px] uppercase tracking-widest px-8">Timestamp</TableHead>
                                    <TableHead className="font-black text-slate-400 text-[11px] uppercase tracking-widest">User Entity</TableHead>
                                    <TableHead className="font-black text-slate-400 text-[11px] uppercase tracking-widest">Activity Description</TableHead>
                                    <TableHead className="font-black text-slate-400 text-[11px] uppercase tracking-widest">Source</TableHead>
                                    <TableHead className="font-black text-slate-400 text-[11px] uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="text-right font-black text-slate-400 text-[11px] uppercase tracking-widest px-8">Net Effect</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center">
                                                <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 opacity-20" />
                                            </TableCell>
                                        </TableRow>
                                    ) : historyItems.length > 0 ? (
                                        historyItems.map((item, index) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                            >
                                                <TableCell className="text-[11px] font-black text-slate-400 px-8">
                                                    {item.createdAt ? format(new Date(item.createdAt), 'MMM d, HH:mm:ss') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm">{item.wallet?.user?.email.split('@')[0] || 'customer_user'}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">@{item.wallet?.user?.email.split('@')[1] || 'mcom.com'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                                                        <span className="text-sm font-bold text-slate-700">{item.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-500 px-2 py-0.5 uppercase tracking-tighter">
                                                        {item.sourcePlatform === 'MCOM_LOYALTY' ? 'Loyalty Eng' : 'Mall Unit'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(item.status)}
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <div className={`text-sm font-black ${Number(item.amount ?? 0) >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                        {Number(item.amount ?? 0) >= 0 ? '+' : ''}{item.unit === 'GBP' ? '£' : ''}{Math.abs(Number(item.amount ?? 0)).toFixed(2)}{item.unit === 'CREDITS' ? ' CR' : ''}
                                                        <ExternalLink className="inline-block w-3 h-3 ml-2 text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-indigo-500 transition-all" />
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center text-slate-400 font-bold">
                                                No transactions found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between p-6 border-t border-slate-50 bg-slate-50/20">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Audit Data: Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 font-bold text-xs bg-white"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <div className="flex gap-1">
                                {[...Array(Math.min(3, totalPages))].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-1.5 rounded-full ${page === i + 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 font-bold text-xs bg-white"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function AdminStatCard({ title, value, icon, trend }: any) {
    return (
        <Card className="border-none shadow-xl bg-white group hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                        {icon}
                    </div>
                    <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {trend}
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
            </CardContent>
        </Card>
    );
}
