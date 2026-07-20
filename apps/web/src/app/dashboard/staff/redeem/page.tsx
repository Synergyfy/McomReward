"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetGeneralAnalytics } from "@/services/business-dashboard/hook";
import { useGetBusinessRewards } from "@/services/business-reward/hooks";
import Loader from "@/components/ui/loader";

type CustomerType = {
    id: string;
    name: string;
    email: string;
    points: number;
};

export default function StaffRedeemPage() {
    const form = useForm<{ searchId: string }>({ defaultValues: { searchId: "" } });
    const [customer, setCustomer] = useState<CustomerType | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: analytics, isLoading } = useGetGeneralAnalytics();
    const { data: rewardsData, isLoading: isLoadingRewards } = useGetBusinessRewards(1, 100);

    const handleSearch = (data: { searchId: string }) => {
        setSearchQuery(data.searchId);
        if (!analytics?.lastTenActivities) return;

        const activity = analytics.lastTenActivities.find(
            (a) =>
                a.participant?.email?.toLowerCase() === data.searchId.toLowerCase() ||
                a.participant?.name?.toLowerCase().includes(data.searchId.toLowerCase())
        );

        if (activity?.participant) {
            setCustomer({
                id: activity.participant.id,
                name: activity.participant.name,
                email: activity.participant.email,
                points: activity.type === "EARN" ? activity.points : 0,
            });
        }
    };

    if (isLoading || isLoadingRewards) {
        return <div className="min-h-[88vh] flex items-center justify-center"><Loader /></div>;
    }

    const rewards = rewardsData?.data || [];

    return (
        <div className="min-h-[88vh] bg-white p-4 md:p-6 py-10">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        Search for a customer to redeem rewards.
                    </h1>
                </div>

                <Card className="border-orange-200">
                    <CardHeader>
                        <CardTitle>Find Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            onSubmit={form.handleSubmit(handleSearch)}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <Input
                                placeholder="Enter Customer Email"
                                {...form.register("searchId")}
                            />
                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {customer && (
                    <Card className="shadow-md border-orange-200">
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{customer.name}</p>
                                    <p className="text-gray-500 text-sm">{customer.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="font-medium text-gray-700">
                                    Available Rewards
                                </label>
                                {rewards.length > 0 ? (
                                    <div className="grid gap-3">
                                        {rewards.slice(0, 10).map((reward: any) => (
                                            <div
                                                key={reward.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-800">{reward.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Requires {reward.points_required || reward.pointsRequired || 0} pts
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No rewards configured yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
