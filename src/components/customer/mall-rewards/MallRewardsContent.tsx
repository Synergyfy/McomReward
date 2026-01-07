"use client";

import React, { useState } from "react";
import { MallRewardHistoryRecord, GetMallRewardHistoryResponse } from "@/services/business-reward/types";
import {
  Search,
  Gift,
  Ticket,
  Percent,
  RefreshCw,
  CreditCard,
  Store,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LayoutGrid,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { mallIntegrationService } from "@/services/mall-integration";

// Types
interface MallRewardsContentProps {
  data?: GetMallRewardHistoryResponse;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
}

// Premium Mesh Gradient Definitions
const getTypeStyles = (type: string) => {
  switch (type) {
    case "GIFT_CARD":
      return {
        icon: <CreditCard className="w-4 h-4" />,
        gradient: "from-indigo-600 via-purple-600 to-pink-500",
        mesh: "bg-[radial-gradient(at_0%_0%,rgba(99,102,241,0.15)_0,transparent_50%),radial-gradient(at_50%_0%,rgba(168,85,247,0.15)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(236,72,153,0.15)_0,transparent_50%)]",
        text: "text-purple-700",
        label: "Platinum Gift Card",
        tagBg: "bg-purple-100",
        accent: "purple"
      };
    case "VOUCHER":
      return {
        icon: <Ticket className="w-4 h-4" />,
        gradient: "from-blue-600 via-cyan-500 to-teal-400",
        mesh: "bg-[radial-gradient(at_0%_0%,rgba(37,99,235,0.15)_0,transparent_50%),radial-gradient(at_50%_0%,rgba(6,182,212,0.15)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(20,184,166,0.15)_0,transparent_50%)]",
        text: "text-blue-700",
        label: "Exclusive Voucher",
        tagBg: "bg-blue-100",
        accent: "blue"
      };
    case "COUPON":
      return {
        icon: <Percent className="w-4 h-4" />,
        gradient: "from-emerald-600 via-green-500 to-lime-400",
        mesh: "bg-[radial-gradient(at_0%_0%,rgba(5,150,105,0.15)_0,transparent_50%),radial-gradient(at_50%_0%,rgba(34,197,94,0.15)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(132,204,22,0.15)_0,transparent_50%)]",
        text: "text-emerald-700",
        label: "Member Coupon",
        tagBg: "bg-emerald-100",
        accent: "emerald"
      };
    default:
      return {
        icon: <Gift className="w-4 h-4" />,
        gradient: "from-orange-600 via-rose-500 to-amber-400",
        mesh: "bg-[radial-gradient(at_0%_0%,rgba(234,88,12,0.15)_0,transparent_50%),radial-gradient(at_50%_0%,rgba(244,63,94,0.15)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(245,158,11,0.15)_0,transparent_50%)]",
        text: "text-orange-700",
        label: "Premium Reward",
        tagBg: "bg-orange-100",
        accent: "orange"
      };
  }
};

export default function MallRewardsContent({
  data,
  isLoading,
  isError,
  refetch,
  page,
  setPage,
}: MallRewardsContentProps) {
  const [search, setSearch] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

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

      const business = (item as any).business || (reward as any).business;
      const businessName = business?.name || "";

      const matchesSearch =
        reward.title.toLowerCase().includes(search.toLowerCase()) ||
        businessName.toLowerCase().includes(search.toLowerCase()) ||
        (item.redemption_code && item.redemption_code.toLowerCase().includes(search.toLowerCase()));

      return matchesSearch;
    });
  };

  const allRewards = filterHistory(history, "ALL");
  const giftCards = filterHistory(history, "GIFT_CARD");
  const vouchers = filterHistory(history, "VOUCHER");
  const coupons = filterHistory(history, "COUPON");

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Golden code copied!", {
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      className: "rounded-2xl border-amber-100 bg-amber-50 text-amber-900",
    });
  };

  const RewardTicket = ({ item }: { item: MallRewardHistoryRecord }) => {
    const reward = item.businessReward;
    const rewardType = reward.mall_reward_type || (reward as any).mallRewardType;
    const rewardValue = reward.mall_reward_value || (reward as any).mallRewardValue;
    const createdAt = item.created_at || (item as any).createdAt;
    const redemptionCode = item.redemption_code || (item as any).redemptionCode;
    const business = (item as any).business || (reward as any).business;
    const styles = getTypeStyles(rewardType || "");

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="relative group h-full flex flex-col perspective-1000"
      >
        <div className="flex flex-col bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100/50 overflow-hidden h-full transition-all duration-500 relative">

          {/* Subtle Glossy Sweep Effect */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </div>

          {/* Ticket Header (Art Section) */}
          <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${styles.gradient}`}>
            {/* Mesh Texture Overlay */}
            <div className={`absolute inset-0 ${styles.mesh} mix-blend-overlay`} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

            {reward.image ? (
              <img
                src={reward.image}
                alt={reward.title}
                className="w-full h-full object-cover mix-blend-soft-light transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift size={80} className="text-white opacity-20" />
              </div>
            )}

            {/* Float Pattern */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-96 h-96 border-[0.5px] border-white rounded-full flex items-center justify-center"
              >
                <div className="w-64 h-64 border-[0.5px] border-white rounded-full" />
              </motion.div>
            </div>

            {/* Type Indicator */}
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-white/90 backdrop-blur-md text-gray-900 border-none px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase">
                <div className={`w-1.5 h-1.5 rounded-full bg-${styles.accent}-500 animate-pulse`} />
                {styles.label}
              </Badge>
            </div>

            {/* Value Diamond */}
            <div className="absolute bottom-0 right-0 p-3 transform translate-y-2 translate-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full translate-y-2" />
                <div className="bg-white px-4 py-2.5 rounded-2xl shadow-2xl relative border border-white/50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 text-center">Value</p>
                  <p className="text-lg font-black text-gray-900 leading-none tracking-tight">
                    {rewardValue ? `£${parseFloat(rewardValue.toString()).toFixed(2)}` : "FREE"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-5 pt-6 flex flex-col flex-1 relative bg-white">

            {/* Real Perforation Cutouts */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-50 border border-gray-100 rounded-full shadow-inner z-20 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gray-50/50 backdrop-blur-sm" />
            </div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 border border-gray-100 rounded-full shadow-inner z-20 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gray-50/50 backdrop-blur-sm" />
            </div>

            {/* Perforated Divider Line */}
            <div className="absolute top-0 left-5 right-5 h-[2px] border-t-2 border-dashed border-gray-100 -translate-y-[1px]" />

            <div className="space-y-4 flex-1 flex flex-col">
              <div>
                <motion.h3 className="font-black text-gray-900 text-[15px] leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-orange-500 transition-all duration-300 line-clamp-2">
                  {reward.title}
                </motion.h3>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-orange-100 transition-colors shadow-sm">
                    <Store size={12} className="text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-black text-gray-400 leading-none mb-0.5">Store / Partner</span>
                    <span className="text-[11px] font-bold text-gray-700 truncate">{business?.name || "Global Partner"}</span>
                  </div>
                </div>
              </div>

              {/* Secure Reward Strip */}
              <div className="mt-auto space-y-3">
                <div className="p-3 rounded-2xl bg-gray-50/80 border border-dashed border-gray-200 group-hover:border-orange-200 group-hover:bg-orange-50/30 transition-all duration-500 relative overflow-hidden">
                  {/* Security Pattern bg */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/gplay.png')] pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-black text-gray-400 tracking-[0.2em] mb-0.5">Access Code</span>
                      <code className="text-base font-mono font-black text-gray-600 tracking-wider group-hover:text-orange-900 transition-colors">
                        {redemptionCode?.replace(/.{4}(?!$)/g, '$& ') || "---- ---- ----"}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:translate-y-[-2px] transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(redemptionCode);
                      }}
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={10} />
                    <span>{createdAt ? new Date(createdAt).toLocaleDateString() : "Live"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 py-1 px-2 bg-emerald-50 rounded-lg">
                    <CheckCircle2 size={10} />
                    <span>SECURE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-5 pb-5 bg-white">
            <Button
              className={`w-full h-11 rounded-xl bg-black hover:bg-orange-600 text-white font-black text-[11px] uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-orange-500/30 transition-all duration-300 group/btn`}
            >
              <span className="flex-1 text-left">View Full Ticket</span>
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                <ArrowRight size={14} />
              </div>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState = ({ type }: { type: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto py-24 px-8 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.05)_0,transparent_70%)]" />
      <div className="relative mb-10">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto relative">
          <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-ping" />
          <Gift size={40} className="text-orange-500 relative z-10" />
        </div>
      </div>
      <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
        Locker is Empty
      </h3>
      <p className="text-gray-500 text-lg mb-10 font-medium">
        Go shopping and earn points to unlock exclusive {type === "REWARD" ? "rewards" : type.replace("_", " ").toLowerCase() + "s"} from your favorite stores.
      </p>
      <Button
        variant="outline"
        className="h-14 px-10 rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 font-black text-sm uppercase tracking-widest"
        onClick={() => refetch()}
      >
        Scan for Rewards
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20 text-white w-fit"
            >
              <Sparkles size={16} fill="currentColor" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">VIP Membership active</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]"
            >
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Treasures</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-xl font-bold max-w-2xl leading-relaxed"
            >
              A high-security vault for your earned vouchers, digital gift cards, and store-specific coupons.
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                +12k
              </div>
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest hidden sm:block">Joining the network</p>
          </div>
        </div>

        {/* Dynamic Search & Controls */}
        <div className="grid lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-300" />
            <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] shadow-sm px-6 py-2">
              <Search className="text-gray-400 w-6 h-6 mr-4" />
              <Input
                placeholder="Search vouchers, stores, or distribution codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none focus:ring-0 text-lg font-bold placeholder:text-gray-300 h-14 bg-transparent outline-none shadow-none"
              />
              <div className="hidden md:flex gap-2">
                <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border-none rounded-xl px-4 py-2 font-black text-[10px] tracking-widest uppercase">Esc</Badge>
                <Badge className="bg-orange-500 text-white hover:bg-orange-500 border-none rounded-xl px-4 py-2 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-orange-500/20">/</Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-16 rounded-[2.5rem] border-gray-100 bg-white hover:bg-white hover:border-orange-500 hover:text-orange-500 shadow-sm transition-all duration-300 font-black text-sm uppercase tracking-widest px-8"
            onClick={() => refetch()}
          >
            <RefreshCw className={`h-5 w-5 mr-3 ${isLoading ? "animate-spin" : ""}`} />
            Sync Vault
          </Button>
          <Button
            className="h-16 rounded-[2.5rem] bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all duration-300 font-black text-sm uppercase tracking-widest px-8 group"
            onClick={handleGoToMall}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <ExternalLink className="h-5 w-5 mr-3 group-hover:translate-x-1 transition-transform" />
            )}
            Go to Mall
          </Button>
        </div>

        {/* Content Navigation */}
        <Tabs defaultValue="all-rewards" className="w-full space-y-12" onValueChange={() => setPage(1)}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger value="all-rewards" className="relative h-12 px-0 bg-transparent text-gray-400 data-[state=active]:text-gray-900 border-none rounded-none text-2xl font-black transition-all group">
                <span className="relative z-10">All items</span>
                <div className="absolute -bottom-2 left-0 w-0 h-1.5 bg-orange-500 rounded-full transition-all duration-300 group-data-[state=active]:w-full" />
              </TabsTrigger>
              <TabsTrigger value="gift-cards" className="h-12 px-0 bg-transparent text-gray-400 data-[state=active]:text-gray-900 border-none rounded-none text-2xl font-black transition-all group">
                <span className="relative z-10">Gift Cards</span>
                <div className="absolute -bottom-2 left-0 w-0 h-1.5 bg-purple-500 rounded-full transition-all duration-300 group-data-[state=active]:w-full" />
              </TabsTrigger>
              <TabsTrigger value="vouchers" className="h-12 px-0 bg-transparent text-gray-400 data-[state=active]:text-gray-900 border-none rounded-none text-2xl font-black transition-all group">
                <span className="relative z-10">Vouchers</span>
                <div className="absolute -bottom-2 left-0 w-0 h-1.5 bg-blue-500 rounded-full transition-all duration-300 group-data-[state=active]:w-full" />
              </TabsTrigger>
              <TabsTrigger value="coupons" className="h-12 px-0 bg-transparent text-gray-400 data-[state=active]:text-gray-900 border-none rounded-none text-2xl font-black transition-all group">
                <span className="relative z-10">Coupons</span>
                <div className="absolute -bottom-2 left-0 w-0 h-1.5 bg-emerald-500 rounded-full transition-all duration-300 group-data-[state=active]:w-full" />
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm font-black text-gray-900">{allRewards.length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Rewards total</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="py-12"
              >
                <div className="max-w-xl mx-auto bg-white rounded-[3rem] border border-red-50 p-12 text-center shadow-xl">
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Sync Interrupted</h3>
                  <p className="text-gray-500 mb-8 font-medium">We lost connection to our security vault. Please try re-authenticating.</p>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-12 h-14 font-black text-sm uppercase tracking-widest"
                    onClick={() => refetch()}
                  >
                    Restore connection
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="min-h-[500px]">
                <TabsContent value="all-rewards" className="m-0 focus-visible:outline-none">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4">
                          <Skeleton className="h-40 w-full rounded-2xl" />
                          <Skeleton className="h-6 w-3/4 rounded-lg" />
                          <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : allRewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allRewards.map((item) => <RewardTicket key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="REWARD" />}
                </TabsContent>

                <TabsContent value="gift-cards" className="m-0 focus-visible:outline-none">
                  {giftCards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {giftCards.map((item) => <RewardTicket key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="GIFT_CARD" />}
                </TabsContent>

                <TabsContent value="vouchers" className="m-0 focus-visible:outline-none">
                  {vouchers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {vouchers.map((item) => <RewardTicket key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="VOUCHER" />}
                </TabsContent>

                <TabsContent value="coupons" className="m-0 focus-visible:outline-none">
                  {coupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coupons.map((item) => <RewardTicket key={item.id} item={item} />)}
                    </div>
                  ) : <EmptyState type="COUPON" />}
                </TabsContent>
              </div>
            )}
          </AnimatePresence>
        </Tabs>

        {/* High-End Pagination Controls */}
        {!isLoading && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-2xl shadow-orange-500/5 relative"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/10 to-transparent" />

            <div className="flex items-center gap-6 mb-8 sm:mb-0">
              <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-orange-500 opacity-5 rounded-[1.5rem] animate-pulse" />
                <LayoutGrid size={24} className="text-orange-500 relative z-10" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 tracking-tighter">Page {page} of {totalPages}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Vault Distribution Records</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none rounded-2xl h-16 px-10 border-gray-100 font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:border-orange-500 shadow-sm transition-all disabled:opacity-30"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={20} className="mr-3" /> Previous
              </Button>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none rounded-2xl h-16 px-10 border-gray-100 font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:border-orange-500 shadow-sm transition-all disabled:opacity-30"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={20} className="ml-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Visual background details */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10 pointer-events-none" />
    </div>
  );
}
