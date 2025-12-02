'use client';

import React from 'react';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    QrCode,
    Scan,
    Gift,
    DollarSign,
    Share2,
    Download,
    MapPin,
    Clock,
    ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { plaqueUserSummary, plaqueList, recentActivity } from '@/lib/mock-data/plaque-dashboard';

export default function PlaqueUserDashboard() {
    return (
        <div className="space-y-6">
            {/* Top Area: Business Card & KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Business Info Card - could be more detailed but keeping it simple as per req */}
                <Card className="col-span-full md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-xl font-bold">My Business</h2>
                            <p className="text-gray-400 text-sm">John Doe</p>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Plan</p>
                            <p className="font-medium text-orange-400">Premium Partner</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                        <Scan className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plaqueUserSummary.totalScans}</div>
                        <p className="text-xs text-muted-foreground">Lifetime scans</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scans (30d)</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plaqueUserSummary.scans30d}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plaqueUserSummary.redemptions30d}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Area: Plaque List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">My Plaques</h2>
                    <Link href="/plaque-user/plaques" className="text-sm text-orange-600 hover:underline">
                        View all
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plaqueList.map((plaque) => (
                        <Card key={plaque.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <QrCode className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{plaque.name}</h3>
                                            <p className="text-xs text-muted-foreground">{plaque.id}</p>
                                        </div>
                                    </div>
                                    <Badge variant={plaque.status === 'Active' ? 'default' : 'secondary'}>
                                        {plaque.status}
                                    </Badge>
                                </div>
                                <div className="px-4 pb-3 text-sm text-gray-500 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {plaque.location}
                                </div>
                                <div className="bg-gray-50 p-3 flex justify-between items-center border-t">
                                    <div className="text-xs font-medium">
                                        {plaque.scans30d} scans (30d)
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Share">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Bottom Area: Recent Activity & Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <Link href="/plaque-user/scans">
                            <Button variant="ghost" size="sm" className="text-xs">
                                See all activity <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                                    <div className={`mt-1 h-2 w-2 rounded-full mr-3 ${activity.type === 'scan' ? 'bg-blue-500' :
                                            activity.type === 'redemption' ? 'bg-green-500' : 'bg-orange-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" size="lg">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share My Plaque
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="lg">
                                <Download className="mr-2 h-4 w-4" />
                                Download Plaque
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-100">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-orange-800 mb-1">Need Help?</h3>
                            <p className="text-sm text-orange-700 mb-3">
                                Check our guide on how to place your plaque for maximum scans.
                            </p>
                            <Link href="/plaque-user/help">
                                <Button variant="link" className="p-0 h-auto text-orange-800 underline">
                                    Read Guide
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
