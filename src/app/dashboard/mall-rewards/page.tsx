"use client";

import React, { useState } from "react";
import { useGetBusinessRewards } from "@/services/business-reward/hooks";
import { BusinessReward } from "@/services/business-reward/types";
import {
  Search,
  Filter,
  Gift,
  Ticket,
  Percent,
  RefreshCw,
  Wallet,
  CreditCard,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function VouchersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 50; // Fetch a larger batch for client-side filtering efficiency

  const { data, isLoading, isError, refetch } = useGetBusinessRewards(page, limit);

  const rewards = data?.data || [];

  // Filter rewards based on search, status, and tab (handled in render)
  const filterRewards = (items: BusinessReward[], type: string) => {
    return items.filter((reward) => {
      const matchesSearch =
        reward.title.toLowerCase().includes(search.toLowerCase()) ||
        (reward.description && reward.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus =
        statusFilter === "all" ||
        (reward.status && reward.status.toLowerCase() === statusFilter.toLowerCase());

      const isMallIntegrated = reward.is_mall_integrated;
      const matchesType = reward.mall_reward_type === type;

      return isMallIntegrated && matchesType && matchesSearch && matchesStatus;
    });
  };

  const giftCards = filterRewards(rewards, "GIFT_CARD");
  const vouchers = filterRewards(rewards, "VOUCHER");
  const coupons = filterRewards(rewards, "COUPON");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "GIFT_CARD":
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case "VOUCHER":
        return <Ticket className="w-5 h-5 text-blue-600" />;
      case "COUPON":
        return <Percent className="w-5 h-5 text-green-600" />;
      default:
        return <Gift className="w-5 h-5 text-orange-600" />;
    }
  };

  const RewardCard = ({ reward }: { reward: BusinessReward }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-l-4 border-l-orange-500">
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {reward.image ? (
          <img
            src={reward.image}
            alt={reward.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
            <Gift size={64} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant={reward.status === "active" ? "default" : "secondary"}
            className={
              reward.status === "active"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 hover:bg-gray-600"
            }
          >
            {reward.status || "Draft"}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
           <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-sm border-orange-200 text-orange-700 font-semibold flex items-center gap-1">
              {getTypeIcon(reward.mall_reward_type || "")}
              {reward.mall_reward_type?.replace("_", " ")}
           </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
            {reward.title}
            </h3>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
            {reward.description || "No description provided."}
        </p>
      </CardHeader>

      <CardContent className="pb-2 space-y-3">
        <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
            <span className="text-gray-600">Value</span>
            <span className="font-bold text-gray-900">
                {reward.mall_reward_value 
                    ? `£${parseFloat(reward.mall_reward_value.toString()).toFixed(2)}` 
                    : "N/A"}
            </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          <span>
            Created: {new Date(reward.createdAt).toLocaleDateString()}
          </span>
        </div>
         {reward.expiryDatetime && (
            <div className="flex items-center gap-2 text-xs text-red-500">
            <AlertCircle size={14} />
            <span>
                Expires: {new Date(reward.expiryDatetime).toLocaleDateString()}
            </span>
            </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
          Manage Reward
        </Button>
      </CardFooter>
    </Card>
  );

  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        {type === "GIFT_CARD" && <CreditCard className="w-10 h-10 text-gray-400" />}
        {type === "VOUCHER" && <Ticket className="w-10 h-10 text-gray-400" />}
        {type === "COUPON" && <Percent className="w-10 h-10 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No {type.replace("_", " ").toLowerCase()}s found
      </h3>
      <p className="text-gray-500 max-w-sm mb-6">
        You haven't created any {type.replace("_", " ").toLowerCase()}s yet, or they don't match your current filters.
      </p>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh List
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-orange-600" />
            Rewards & Vouchers
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your cross-platform rewards, gift cards, and coupons.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} title="Refresh Data">
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
                Create New Reward
            </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search rewards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-gray-50 border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="gift-cards" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] p-1 bg-gray-200/50 rounded-xl">
          <TabsTrigger 
            value="gift-cards" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Gift Cards
          </TabsTrigger>
          <TabsTrigger 
            value="vouchers"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            Vouchers
          </TabsTrigger>
          <TabsTrigger 
            value="coupons"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
          >
            Coupons
          </TabsTrigger>
        </TabsList>

        {isError ? (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-red-800">Failed to load rewards</h3>
                <p className="text-red-600 mb-4">Something went wrong while fetching your data.</p>
                <Button variant="outline" onClick={() => refetch()} className="border-red-200 hover:bg-red-100 text-red-700">
                    Try Again
                </Button>
            </div>
        ) : (
            <>
                <TabsContent value="gift-cards" className="space-y-4 focus-visible:outline-none">
                    {isLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="h-80"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
                            ))}
                        </div>
                    ) : giftCards.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {giftCards.map((reward) => (
                                <RewardCard key={reward.id} reward={reward} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="GIFT_CARD" />
                    )}
                </TabsContent>

                <TabsContent value="vouchers" className="space-y-4 focus-visible:outline-none">
                    {isLoading ? (
                         <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {[1, 2, 3, 4].map((i) => (
                             <Card key={i} className="h-80"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
                         ))}
                     </div>
                    ) : vouchers.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {vouchers.map((reward) => (
                                <RewardCard key={reward.id} reward={reward} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="VOUCHER" />
                    )}
                </TabsContent>

                <TabsContent value="coupons" className="space-y-4 focus-visible:outline-none">
                    {isLoading ? (
                         <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {[1, 2, 3, 4].map((i) => (
                             <Card key={i} className="h-80"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
                         ))}
                     </div>
                    ) : coupons.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {coupons.map((reward) => (
                                <RewardCard key={reward.id} reward={reward} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="COUPON" />
                    )}
                </TabsContent>
            </>
        )}
      </Tabs>
    </div>
  );
}

