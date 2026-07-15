'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetDetailedCampaignAnalytics } from '@/services/campaigns/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trophy, Award, Percent } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function CampaignDetailedPerformancePage() {
    const params = useParams();
    const router = useRouter();
    const { campaignId } = params;
    const { data: analytics, isLoading } = useGetDetailedCampaignAnalytics(campaignId as string);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex justify-center items-center">
                <p className="text-lg text-gray-500">Loading detailed analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col justify-center items-center">
                <p className="text-lg text-gray-500 mb-4">Analytics not found.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Campaign Performance Details</h1>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalRewardsRedeemed}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Points Awarded</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalPointsAwarded ? parseInt(analytics.totalPointsAwarded).toLocaleString() : '0'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.redemptionRate}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Weekly Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.weeklyChartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                                    <YAxis />
                                    <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString()} />
                                    <Legend />
                                    <Bar dataKey="pointsAwarded" name="Points Awarded" fill="#f97316" />
                                    <Bar dataKey="rewardsRedeemed" name="Rewards Redeemed" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>New Participants Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.weeklyChartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                                    <YAxis />
                                    <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString()} />
                                    <Legend />
                                    <Line type="monotone" dataKey="newParticipants" name="New Participants" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Rewards & Ranked Participants */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Rewards</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reward Title</TableHead>
                                            <TableHead>Points Required</TableHead>
                                            <TableHead className="text-right">Redemptions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analytics.topRewards && analytics.topRewards.length > 0 ? (
                                            analytics.topRewards.map((reward) => (
                                                <TableRow key={reward.id}>
                                                    <TableCell className="font-medium">{reward.rTitle}</TableCell>
                                                    <TableCell>{reward.rPointsRequired}</TableCell>
                                                    <TableCell className="text-right">{reward.totalRedemptions}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-gray-500">No rewards data available</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Participants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Points Earned</TableHead>
                                            <TableHead className="text-right">Redemptions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analytics.rankedParticipants && analytics.rankedParticipants.length > 0 ? (
                                            analytics.rankedParticipants.map((participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell className="font-medium">
                                                        <div>{participant.pName}</div>
                                                        <div className="text-xs text-gray-500">{participant.pEmail}</div>
                                                    </TableCell>
                                                    <TableCell>{participant.totalPointsEarned}</TableCell>
                                                    <TableCell className="text-right">{participant.totalRedemptions}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-gray-500">No participants data available</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
