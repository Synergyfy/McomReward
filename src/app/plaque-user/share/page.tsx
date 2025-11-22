'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Plus, Facebook, Twitter, Linkedin, MoreHorizontal, Trash2, BarChart2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ShareCampaignsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Share & Campaigns</h1>
                    <p className="text-muted-foreground">Create tracking links and share your plaque.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Campaign Link</DialogTitle>
                            <DialogDescription>
                                Create a unique link to track where your scans are coming from.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input id="name" placeholder="e.g. Summer Newsletter" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="plaque">Select Plaque</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option>Main Entrance (PLQ-001)</option>
                                    <option>Counter Display (PLQ-002)</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="onetime" />
                                <Label htmlFor="onetime">One-time use link</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Link</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Share</CardTitle>
                        <CardDescription>Share your main plaque link directly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                            <Input value="https://plaque.link/p/PLQ-001" readOnly />
                            <Button variant="outline" size="icon">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-none">
                                <Facebook className="mr-2 h-4 w-4" /> Facebook
                            </Button>
                            <Button variant="outline" className="flex-1 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 border-none">
                                <Twitter className="mr-2 h-4 w-4" /> Twitter
                            </Button>
                            <Button variant="outline" className="flex-1 bg-[#25D366] text-white hover:bg-[#25D366]/90 border-none">
                                WhatsApp
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Performance</CardTitle>
                        <CardDescription>Overview of your active campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Total Campaign Clicks</p>
                                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                                </div>
                                <div className="text-2xl font-bold">482</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Top Campaign</p>
                                    <p className="text-sm text-muted-foreground">Summer Sale 2024</p>
                                </div>
                                <div className="text-2xl font-bold">156</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Clicks</TableHead>
                                <TableHead>Scans</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Summer Sale 2024</TableCell>
                                <TableCell>Jun 12, 2024</TableCell>
                                <TableCell>156</TableCell>
                                <TableCell>42</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Copy className="mr-2 h-4 w-4" /> Copy Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <BarChart2 className="mr-2 h-4 w-4" /> View Stats
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Instagram Bio</TableCell>
                                <TableCell>Jan 15, 2024</TableCell>
                                <TableCell>326</TableCell>
                                <TableCell>89</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Copy className="mr-2 h-4 w-4" /> Copy Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <BarChart2 className="mr-2 h-4 w-4" /> View Stats
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
