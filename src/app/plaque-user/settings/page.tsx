'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Bell, User, Smartphone, CreditCard } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings & Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="devices">Linked Devices</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal and business details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="John Doe" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="john@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="business">Business Name</Label>
                                <Input id="business" defaultValue="My Awesome Store" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Daily Summary</Label>
                                    <p className="text-sm text-muted-foreground">Receive a daily email with scan stats.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Immediate Scan Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified instantly when someone scans.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Weekly Earnings Report</Label>
                                    <p className="text-sm text-muted-foreground">Weekly summary of your commissions.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Button variant="outline">Save Preferences</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="devices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Linked NFC Devices</CardTitle>
                            <CardDescription>Manage NFC devices linked to your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Smartphone className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">NFC Tag #8821</p>
                                        <p className="text-sm text-muted-foreground">Linked to Plaque #PLQ-001</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Unlink</Button>
                            </div>
                            <Button>
                                <Smartphone className="mr-2 h-4 w-4" /> Pair New Device
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Invoices</CardTitle>
                            <CardDescription>Manage your subscription and payment methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-orange-900">Premium Plan</p>
                                        <p className="text-sm text-orange-700">$29.00 / month</p>
                                    </div>
                                    <Button variant="outline" className="border-orange-200 text-orange-900 hover:bg-orange-100">
                                        Manage Subscription
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                                <div className="flex items-center space-x-4 border p-3 rounded-md">
                                    <CreditCard className="h-5 w-5 text-gray-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Visa ending in 4242</p>
                                        <p className="text-xs text-muted-foreground">Expires 12/25</p>
                                    </div>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
