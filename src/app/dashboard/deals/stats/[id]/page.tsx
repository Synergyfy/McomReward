'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetDeal } from '@/services/deals/hook';
import { Loader2, AlertCircle, TrendingUp, Users, Eye, ShoppingCart, Calendar, ArrowLeft, Target, Percent, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, parseISO } from 'date-fns';
import Image from 'next/image';

// Mock performance data
const mockPerformanceData = {
    views: 1247,
    uniqueVisitors: 892,
    redemptions: 156,
    conversionRate: 17.5,
    averageTimeOnPage: '2m 34s',
    clickThroughRate: 42.3,
    shareCount: 89,
    wishlistAdds: 234,
    revenueGenerated: 7800,
    dailyStats: [
        { date: '2024-01-01', views: 45, redemptions: 5 },
        { date: '2024-01-02', views: 67, redemptions: 8 },
        { date: '2024-01-03', views: 89, redemptions: 12 },
        { date: '2024-01-04', views: 123, redemptions: 18 },
        { date: '2024-01-05', views: 156, redemptions: 22 },
        { date: '2024-01-06', views: 134, redemptions: 19 },
        { date: '2024-01-07', views: 178, redemptions: 25 },
    ],
    topLocations: [
        { name: 'London', percentage: 35 },
        { name: 'Manchester', percentage: 22 },
        { name: 'Birmingham', percentage: 18 },
        { name: 'Leeds', percentage: 12 },
        { name: 'Other', percentage: 13 },
    ],
    deviceBreakdown: {
        mobile: 62,
        desktop: 31,
        tablet: 7,
    }
};

export default function DealPerformancePage() {
    const params = useParams();
    const dealId = params.id as string;

    const { data: deal, isLoading, isError } = useGetDeal(dealId);

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
                        <h1 className="text-3xl font-bold text-gray-800">Deal Performance</h1>
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
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold mt-4">{mockPerformanceData.views.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Total Views</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <Users className="text-purple-600" size={24} />
                            </div>
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold mt-4">{mockPerformanceData.uniqueVisitors.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Unique Visitors</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <ShoppingCart className="text-emerald-600" size={24} />
                            </div>
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold mt-4">{mockPerformanceData.redemptions}</p>
                        <p className="text-sm text-gray-500 mt-1">Redemptions</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                <Percent className="text-orange-600" size={24} />
                            </div>
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <p className="text-3xl font-bold mt-4">{mockPerformanceData.conversionRate}%</p>
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
                                <span className="font-medium">Avg. Time on Page</span>
                            </div>
                            <span className="font-bold">{mockPerformanceData.averageTimeOnPage}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Target className="text-purple-600" size={18} />
                                </div>
                                <span className="font-medium">Click-through Rate</span>
                            </div>
                            <span className="font-bold">{mockPerformanceData.clickThroughRate}%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                                    <TrendingUp className="text-pink-600" size={18} />
                                </div>
                                <span className="font-medium">Wishlist Adds</span>
                            </div>
                            <span className="font-bold">{mockPerformanceData.wishlistAdds}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <ShoppingCart className="text-emerald-600" size={18} />
                                </div>
                                <span className="font-medium">Revenue Generated</span>
                            </div>
                            <span className="font-bold text-emerald-600">£{mockPerformanceData.revenueGenerated.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Breakdown */}
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Locations</CardTitle>
                        <CardDescription>Where your customers are coming from</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockPerformanceData.topLocations.map((location, index) => (
                            <div key={location.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="font-medium">{location.name}</span>
                                    </div>
                                    <span className="font-bold">{location.percentage}%</span>
                                </div>
                                <Progress value={location.percentage} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Device Breakdown */}
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Device Breakdown</CardTitle>
                    <CardDescription>How users are accessing your deal</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
                                <span className="text-2xl">📱</span>
                            </div>
                            <p className="text-3xl font-bold">{mockPerformanceData.deviceBreakdown.mobile}%</p>
                            <p className="text-sm text-gray-600 mt-1">Mobile</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-200">
                                <span className="text-2xl">💻</span>
                            </div>
                            <p className="text-3xl font-bold">{mockPerformanceData.deviceBreakdown.desktop}%</p>
                            <p className="text-sm text-gray-600 mt-1">Desktop</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-orange-200">
                                <span className="text-2xl">📟</span>
                            </div>
                            <p className="text-3xl font-bold">{mockPerformanceData.deviceBreakdown.tablet}%</p>
                            <p className="text-sm text-gray-600 mt-1">Tablet</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Note about mock data */}
            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-amber-600" size={20} />
                    </div>
                    <p className="text-sm text-amber-800">
                        <strong>Note:</strong> This page is currently showing mock data for demonstration purposes.
                        Real analytics will be available once the backend performance tracking is implemented.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
