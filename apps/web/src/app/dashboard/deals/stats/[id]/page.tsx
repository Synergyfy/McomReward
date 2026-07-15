'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetDeal, useGetDealAnalytics } from '@/services/deals/hook';
import { Loader2, AlertCircle, TrendingUp, Users, Eye, ShoppingCart, Calendar, ArrowLeft, Target, Percent, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, parseISO } from 'date-fns';
import Image from 'next/image';

export default function DealPerformancePage() {
    const params = useParams();
    const dealId = params.id as string;

    const { data: deal, isLoading: isLoadingDeal, isError: isErrorDeal } = useGetDeal(dealId);
    const { data: analytics, isLoading: isLoadingAnalytics, isError: isErrorAnalytics } = useGetDealAnalytics(dealId);

    const isLoading = isLoadingDeal || isLoadingAnalytics;
    const isError = isErrorDeal || isErrorAnalytics;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-gray-600">Loading performance data...</p>
            </div>
        );
    }

    if (isError || !deal) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Deal Not Found</h2>
                <p className="text-gray-600 text-center max-w-md">
                    We couldn't find this deal or there was an error loading its performance data.
                </p>
                <Link href="/dashboard/deals">
                    <Button variant="outline">Back to Deals</Button>
                </Link>
            </div>
        );
    }

    const daysRemaining = differenceInDays(parseISO(deal.endDate), new Date());
    const totalDays = differenceInDays(parseISO(deal.endDate), parseISO(deal.startDate));
    const progressPercentage = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));

    // Calculate metrics from real data
    const totalViews = analytics?.totalViews || 0;
    const uniqueViews = analytics?.uniqueViews || 0;
    const redemptions = deal.soldQuantity || 0;
    const conversionRate = totalViews > 0 ? ((redemptions / totalViews) * 100).toFixed(1) : '0';
    const revenueGenerated = redemptions * Number(deal.dealPrice);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/deals">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Deal Performance</h1>
                        <p className="text-gray-500 mt-1">Analytics and insights for your deal</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/deals/edit/${dealId}`}>
                        <Button variant="outline">Edit Deal</Button>
                    </Link>
                    <Badge variant={deal.status === 'approved' ? 'default' : 'secondary'} className="px-3 py-1">
                        {deal.status}
                    </Badge>
                </div>
            </div>

            {/* Deal Summary Card */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-48 bg-gray-50 flex-shrink-0">
                        {deal.imageUrl ? (
                            <Image src={deal.imageUrl} alt={deal.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Target size={48} />
                            </div>
                        )}
                    </div>
                    <CardContent className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{deal.title}</h2>
                                <p className="text-gray-500 mt-1 line-clamp-2">{deal.description}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Deal Price</p>
                                <p className="text-lg font-bold text-primary">£{deal.dealPrice}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Original Price</p>
                                <p className="text-lg font-semibold text-gray-600 line-through">£{deal.originalPrice || deal.dealPrice}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Claimed</p>
                                <p className="text-lg font-bold">{deal.soldQuantity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Days Left</p>
                                <p className={`text-lg font-bold ${daysRemaining <= 7 ? 'text-red-500' : 'text-gray-900'}`}>
                                    {daysRemaining > 0 ? daysRemaining : 'Expired'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-500">Campaign Progress</span>
                                <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Eye className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-4">{totalViews.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Total Views</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <Users className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-4">{uniqueViews.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Unique Visitors</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <ShoppingCart className="text-emerald-600" size={24} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-4">{redemptions}</p>
                        <p className="text-sm text-gray-500 mt-1">Redemptions</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                <Percent className="text-orange-600" size={24} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-4">{conversionRate}%</p>
                        <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Metrics */}
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                        <CardDescription>How users are interacting with your deal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Clock className="text-blue-600" size={18} />
                                </div>
                                <span className="font-medium">Avg. Time Spent</span>
                            </div>
                            <span className="font-bold">{formatTime(analytics?.averageTimeSpentSeconds || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <ShoppingCart className="text-emerald-600" size={18} />
                                </div>
                                <span className="font-medium">Revenue Generated</span>
                            </div>
                            <span className="font-bold text-emerald-600">£{revenueGenerated.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Device Breakdown */}
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Device Breakdown</CardTitle>
                        <CardDescription>How users are accessing your deal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analytics?.deviceBreakdown && Object.entries(analytics.deviceBreakdown).length > 0 ? (
                            Object.entries(analytics.deviceBreakdown).map(([device, count]) => {
                                const percentage = totalViews > 0 ? (((count as number) / totalViews) * 100).toFixed(1) : '0';
                                return (
                                    <div key={device} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium capitalize">{device}</span>
                                            </div>
                                            <span className="font-bold">{percentage}%</span>
                                        </div>
                                        <Progress value={Number(percentage)} className="h-2" />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-gray-500">No device data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Browser & OS Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Browser Breakdown */}
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Browser Breakdown</CardTitle>
                        <CardDescription>Most used browsers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analytics?.browserBreakdown && Object.entries(analytics.browserBreakdown).length > 0 ? (
                            Object.entries(analytics.browserBreakdown).map(([browser, count]) => {
                                const percentage = totalViews > 0 ? (((count as number) / totalViews) * 100).toFixed(1) : '0';
                                return (
                                    <div key={browser} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{browser}</span>
                                            <span className="font-bold">{percentage}%</span>
                                        </div>
                                        <Progress value={Number(percentage)} className="h-2" />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-gray-500">No browser data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* OS Breakdown */}
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">OS Breakdown</CardTitle>
                        <CardDescription>Operating systems used</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analytics?.osBreakdown && Object.entries(analytics.osBreakdown).length > 0 ? (
                            Object.entries(analytics.osBreakdown).map(([os, count]) => {
                                const percentage = totalViews > 0 ? (((count as number) / totalViews) * 100).toFixed(1) : '0';
                                return (
                                    <div key={os} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{os}</span>
                                            <span className="font-bold">{percentage}%</span>
                                        </div>
                                        <Progress value={Number(percentage)} className="h-2" />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-gray-500">No OS data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
