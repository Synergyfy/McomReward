"use client";

import React, { useState } from "react";
import { useGetMallRewardHistory, useGetMallRewardStats } from "@/services/business-reward/hooks";
import { MallRewardHistoryRecord } from "@/services/business-reward/types";
import {
  Search,
  Gift,
  Ticket,
  Percent,
  RefreshCw,
  Wallet,
  CreditCard,
  Calendar,
  User,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  AlertCircle,
  LayoutGrid,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { mallIntegrationService } from "@/services/mall-integration";

const container = {} as const;
const itemAnim = {} as const;

export default function BusinessMallRewardsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const limit = 12;

  const { data, isLoading, isError, refetch } = useGetMallRewardHistory(page, limit);
  const { data: stats, isLoading: isStatsLoading } = useGetMallRewardStats();

  const handleGoToMall = async () => {
    try {
      setIsRedirecting(true);
      const { redirectUrl } = await mallIntegrationService.getSsoUrl();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("SSO Error:", error);
      toast.error("Failed to connect to Mcom Mall");
    } finally {
      setIsRedirecting(false);
    }
  };

  const history = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const filterHistory = (items: MallRewardHistoryRecord[], type: string | "ALL") => {
    return items.filter((item) => {
      const reward = item.businessReward;
      if (!reward) return false;

      const rewardType = reward.mall_reward_type || (reward as any).mallRewardType;

      if (type !== "ALL" && rewardType !== type) return false;

      const matchesSearch =
        reward.title.toLowerCase().includes(search.toLowerCase()) ||
        item.participant.name.toLowerCase().includes(search.toLowerCase()) ||
        item.participant.email.toLowerCase().includes(search.toLowerCase()) ||
        (item.redemption_code && item.redemption_code.toLowerCase().includes(search.toLowerCase())) ||
        ((item as any).redemptionCode && (item as any).redemptionCode.toLowerCase().includes(search.toLowerCase()));

      return matchesSearch;
    });
  };

  const allRewards = filterHistory(history, "ALL");
  const giftCards = filterHistory(history, "GIFT_CARD");
  const vouchers = filterHistory(history, "VOUCHER");
  const coupons = filterHistory(history, "COUPON");

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "GIFT_CARD":
        return {
          icon: <CreditCard className="w-4 h-4" />,
          gradient: "from-indigo-600 via-purple-600 to-pink-500",
          text: "text-purple-700",
          label: "Platinum Gift Card",
          accent: "purple"
        };
      case "VOUCHER":
        return {
          icon: <Ticket className="w-4 h-4" />,
          gradient: "from-blue-600 via-cyan-500 to-teal-400",
          text: "text-blue-700",
          label: "Exclusive Voucher",
          accent: "blue"
        };
      case "COUPON":
        return {
          icon: <Percent className="w-4 h-4" />,
          gradient: "from-emerald-600 via-green-500 to-lime-400",
          text: "text-emerald-700",
          label: "Member Coupon",
          accent: "emerald"
        };
      default:
        return {
          icon: <Gift className="w-4 h-4" />,
          gradient: "from-orange-600 via-rose-500 to-amber-400",
          text: "text-orange-700",
          label: "Premium Reward",
          accent: "orange"
        };
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Code copied", {
      icon: <Zap className="w-4 h-4 text-orange-500" />,
      className: "rounded-xl border-orange-100"
    });
  };

  const HistoryCard = ({ item }: { item: MallRewardHistoryRecord }) => {
    const reward = item.businessReward;
    const rewardType = reward.mall_reward_type || (reward as any).mallRewardType;
    const rewardValue = reward.mall_reward_value || (reward as any).mallRewardValue;
    const createdAt = item.created_at || (item as any).createdAt;
    const redemptionCode = item.redemption_code || (item as any).redemptionCode;
    const styles = getTypeStyles(rewardType || "");

    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        className="group relative h-full"
      >
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">

          {/* Card Header with Gradient & Image */}
          <div className="relative h-32 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />

            {reward.image ? (
              <img
                src={reward.image}
                alt={reward.title}
                className="w-full h-full object-cover mix-blend-soft-light group-hover:scale-110 transition-transform duration-1000"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift size={48} className="text-white opacity-30" />
              </div>
            )}

            <div className="absolute top-2 left-2">
              <Badge className="bg-white/95 backdrop-blur shadow-sm text-gray-900 border-none px-2.5 py-1 rounded-full flex items-center gap-1 font-black text-[8px] uppercase tracking-wider">
                {styles.icon}
                {styles.label}
              </Badge>
            </div>

            <div className="absolute bottom-2 right-2">
              <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20">
                <span className="text-white font-black text-xs">
                  {rewardValue ? `£${parseFloat(rewardValue.toString()).toFixed(2)}` : "FREE"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-1 flex-col relative bg-white">
            <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

            <div className="mb-4">
              <h3 className="font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1 text-[14px]">
                {reward.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <User size={10} className="text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Customer</span>
                  <span className="text-[10px] font-bold text-gray-600 truncate max-w-[150px]">{item.participant.name}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              {/* Security Strip Style Code */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 group-hover:border-orange-200 group-hover:bg-orange-50/50 transition-all duration-300">
                <div className="flex-1">
                  <p className="text-[7.5px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Redemption Code</p>
                  <code className="text-xs font-mono font-black text-gray-600 group-hover:text-orange-900 transition-colors">
                    {redemptionCode || "N/A"}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-orange-600 hover:border-orange-200 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(redemptionCode);
                  }}
                  disabled={!redemptionCode}
                >
                  <Copy size={12} />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                  <Calendar size={10} />
                  <span>{createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Claimed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
      <div className="bg-white p-4 rounded-2xl shadow-lg mb-4">
        {type === "GIFT_CARD" && <CreditCard className="w-8 h-8 text-gray-200" />}
        {type === "VOUCHER" && <Ticket className="w-8 h-8 text-gray-200" />}
        {type === "COUPON" && <Percent className="w-8 h-8 text-gray-200" />}
        {type === "REWARD" && <History className="w-8 h-8 text-gray-200" />}
      </div>
      <h3 className="text-lg font-black text-gray-900">
        No {type.replace("_", " ").toLowerCase()}s issued
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6 font-medium">
        Records will appear here once customers redeem this reward type.
      </p>
      <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-white" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh History
      </Button>
    </div>
  );

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, gradient }: any) => (
    <Card className={`relative overflow-hidden group border-none shadow-sm ${gradient}`}>
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform duration-500">
        {Icon && <Icon size={80} />}
      </div>
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-wider">{title}</CardTitle>
          <div className={`p-2 rounded-xl bg-white shadow-sm ${colorClass}`}>
            {Icon && <Icon size={16} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
          <ArrowUpRight size={14} className="text-emerald-500" />
          {subtext}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-[1600px] mx-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest w-fit">
            <Sparkles size={12} />
            Analytics Overview
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            Reward <span className="text-orange-600">Distribution</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Track and manage all cross-platform benefits issued to your customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-12 bg-white border-gray-200 hover:bg-gray-50 font-bold transition-all shadow-sm"
            onClick={() => refetch()}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Sync History
          </Button>

          <Button
            className="rounded-xl h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-md group"
            onClick={handleGoToMall}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
            )}
            Go to Mall Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-[1600px] mx-auto">
        <StatCard
          title="Total Distributed"
          value={`£${stats?.totalValue?.toFixed(2) || "0.00"}`}
          subtext="Total value issued"
          icon={Wallet}
          colorClass="text-orange-600"
          gradient="bg-gradient-to-br from-orange-50 to-white"
        />
        <StatCard
          title="Gift Cards"
          value={`£${stats?.giftCardsValue?.toFixed(2) || "0.00"}`}
          subtext={`${stats?.giftCardsCount || 0} cards issued`}
          icon={CreditCard}
          colorClass="text-purple-600"
          gradient="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatCard
          title="Vouchers"
          value={`£${stats?.vouchersValue?.toFixed(2) || "0.00"}`}
          subtext={`${stats?.vouchersCount || 0} units issued`}
          icon={Ticket}
          colorClass="text-blue-600"
          gradient="bg-gradient-to-br from-blue-50 to-white"
        />
        <StatCard
          title="Coupons"
          value={`£${stats?.couponsValue?.toFixed(2) || "0.00"}`}
          subtext={`${stats?.couponsCount || 0} claims made`}
          icon={Percent}
          colorClass="text-emerald-600"
          gradient="bg-gradient-to-br from-emerald-50 to-white"
        />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by customer name, email or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white rounded-xl transition-all border-none shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-10 px-3 flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
              <span className="text-xs font-bold text-gray-700">Latest First</span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all-rewards" className="w-full space-y-6">
          <TabsList className="inline-flex h-12 p-1 bg-gray-100 rounded-xl border border-gray-200/50">
            <TabsTrigger value="all-rewards" className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs">All Activity</TabsTrigger>
            <TabsTrigger value="gift-cards" className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs">Gift Cards</TabsTrigger>
            <TabsTrigger value="vouchers" className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs">Vouchers</TabsTrigger>
            <TabsTrigger value="coupons" className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs">Coupons</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {isError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12"
              >
                <Card className="border-red-100 bg-red-50/50 max-w-md mx-auto rounded-3xl">
                  <CardContent className="py-10 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-red-800">Connection Error</h3>
                    <p className="text-sm text-red-600/70 mb-6 font-medium">We couldn't synchronise with the distribution vault.</p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-10 px-8" onClick={() => refetch()}>Retry Connection</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="min-h-[400px]">
                <TabsContent value="all-rewards" className="m-0 focus-visible:outline-none">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                    </div>
                  ) : allRewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allRewards.map((item) => <HistoryCard key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="REWARD" />}
                </TabsContent>

                <TabsContent value="gift-cards" className="m-0 focus-visible:outline-none">
                  {giftCards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {giftCards.map((item) => <HistoryCard key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="GIFT_CARD" />}
                </TabsContent>

                <TabsContent value="vouchers" className="m-0 focus-visible:outline-none">
                  {vouchers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {vouchers.map((item) => <HistoryCard key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="VOUCHER" />}
                </TabsContent>

                <TabsContent value="coupons" className="m-0 focus-visible:outline-none">
                  {coupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coupons.map((item) => <HistoryCard key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="COUPON" />}
                </TabsContent>
              </div>
            )}
          </AnimatePresence>
        </Tabs>

        {/* Pagination */}
        {!isLoading && history.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-8 pb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <History size={18} className="text-orange-600" />
              </div>
              <p className="text-sm font-bold text-gray-400">
                Viewing page <span className="text-gray-900">{page}</span> of {totalPages}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl font-bold border-gray-200 hover:bg-white px-6"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} className="mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl font-bold border-gray-200 hover:bg-white px-6"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
