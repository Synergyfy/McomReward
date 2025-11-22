'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    QrCode,
    Share2,
    Download,
    MapPin,
    Flag,
    ArrowLeft,
    ExternalLink,
    Smartphone,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { plaqueList, recentActivity } from '@/lib/mock-data/plaque-dashboard';

export default function PlaqueDetailsPage() {
    const params = useParams();
    const plaqueId = params.id as string;

    // In a real app, fetch data based on plaqueId
    const plaque = plaqueList.find(p => p.id === plaqueId) || plaqueList[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/plaque-user/plaques" className="text-sm text-muted-foreground flex items-center hover:text-gray-900">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to My Plaques
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-24 w-24 bg-white border rounded-lg p-2 flex items-center justify-center shadow-sm">
                            <QrCode className="h-16 w-16 text-gray-800" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold">{plaque.name}</h1>
                                <Badge variant={plaque.status === 'Active' ? 'default' : 'secondary'}>
                                    {plaque.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground font-mono text-sm mb-2">{plaque.id}</p>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                {plaque.location}
                                <Button variant="link" className="h-auto p-0 ml-2 text-orange-600">Edit</Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button>
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                        <Button variant="ghost" size="icon" title="Report Issue">
                            <Flag className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Snapshot & KPIs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Scans</p>
                                    <p className="text-2xl font-bold">1,245</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Scans (30d)</p>
                                    <p className="text-2xl font-bold">{plaque.scans30d}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Redemptions</p>
                                    <p className="text-2xl font-bold">42</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Conversion</p>
                                    <p className="text-2xl font-bold">3.4%</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Last Scanned</span>
                                    <span className="font-medium">2 mins ago</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Assigned By</span>
                                    <span className="font-medium">John Doe</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Landing Page Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-[9/16] bg-gray-100 rounded-lg border flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                    <p className="text-sm text-gray-500">Preview of mobile landing page</p>
                                </div>
                                {/* Overlay button */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Open Live
                                    </Button>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                <ExternalLink className="mr-2 h-4 w-4" /> Open Live Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline / Feed */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Activity Feed</CardTitle>
                            <Button variant="outline" size="sm">
                                Export CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex gap-4">
                                        <div className="mt-1">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === 'scan' ? 'bg-blue-100 text-blue-600' :
                                                    activity.type === 'redemption' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                {activity.type === 'scan' ? <Smartphone className="h-4 w-4" /> :
                                                    activity.type === 'redemption' ? <Gift className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.description}</p>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {activity.time}
                                                <span className="mx-2">•</span>
                                                <Globe className="mr-1 h-3 w-3" />
                                                Unknown Location
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* More mock items to fill the list */}
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Smartphone className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">Person scanned Plaque #PLQ-001</p>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Yesterday
                                            <span className="mx-2">•</span>
                                            iPhone 14
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
