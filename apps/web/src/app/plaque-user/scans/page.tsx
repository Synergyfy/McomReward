'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Download, Filter, Search, Smartphone, Gift, DollarSign, Flag } from 'lucide-react';
import { recentActivity } from '@/lib/mock-data/plaque-dashboard';

export default function ScansPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scans & Activity</h1>
                    <p className="text-muted-foreground">View all scan events and activity logs.</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <CardTitle className="flex items-center">Activity Log</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full sm:w-[250px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search activity..." className="pl-8" />
                            </div>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Activity</SelectItem>
                                    <SelectItem value="scan">Scans</SelectItem>
                                    <SelectItem value="redemption">Redemptions</SelectItem>
                                    <SelectItem value="commission">Commissions</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="7d">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="7d">Last 7 Days</SelectItem>
                                    <SelectItem value="30d">Last 30 Days</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivity.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="whitespace-nowrap text-muted-foreground">
                                        {activity.time}
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === 'scan' ? 'bg-blue-100 text-blue-800' :
                                                activity.type === 'redemption' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {activity.type === 'scan' ? 'Scan' :
                                                activity.type === 'redemption' ? 'Redemption' : 'Commission'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {activity.description}
                                    </TableCell>
                                    <TableCell>
                                        {activity.type === 'scan' ? 'QR Code' : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Add more rows to simulate a full table */}
                            <TableRow>
                                <TableCell className="whitespace-nowrap text-muted-foreground">Yesterday</TableCell>
                                <TableCell>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Scan
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">Person scanned Plaque #PLQ-001</TableCell>
                                <TableCell>NFC</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Details</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
