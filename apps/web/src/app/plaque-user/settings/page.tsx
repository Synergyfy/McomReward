'use client';

import React, { useEffect, useState } from 'react';
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
import { useGetBusinessProfile, useUpdateBusinessProfile } from '@/services/business/hook';
import { useGetPlaqueUserPlaques } from '@/services/plaque-user/hook';
import { useGetBusinessSubscription } from '@/services/tiers/hook';

const NOTIF_KEY = 'plaque-user-notification-prefs';

export default function SettingsPage() {
    const { data: profile, isLoading: profileLoading } = useGetBusinessProfile();
    const updateProfile = useUpdateBusinessProfile();
    const { data: plaques, isLoading: plaquesLoading } = useGetPlaqueUserPlaques();
    const { data: subscription } = useGetBusinessSubscription();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [saved, setSaved] = useState(false);

    const [prefs, setPrefs] = useState({ dailySummary: true, scanAlerts: false, weeklyReport: true });

    useEffect(() => {
        if (profile) {
            setName(profile.name ?? '');
            setPhone(profile.phone ?? '');
        }
    }, [profile]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(NOTIF_KEY);
            if (raw) setPrefs(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const savePrefs = () => {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSaveProfile = () => {
        updateProfile.mutate(
            { name, phone },
            { onError: () => alert('Could not save profile. Please try again.') },
        );
    };

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
                            {profileLoading ? (
                                <p className="text-sm text-muted-foreground">Loading profile…</p>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={profile?.email ?? ''} disabled />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                    <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                                        {updateProfile.isPending ? 'Saving…' : updateProfile.isSuccess ? 'Saved' : 'Save Changes'}
                                    </Button>
                                </>
                            )}
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
                                <Switch checked={prefs.dailySummary} onCheckedChange={(v) => setPrefs((p) => ({ ...p, dailySummary: v }))} />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Immediate Scan Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified instantly when someone scans.</p>
                                </div>
                                <Switch checked={prefs.scanAlerts} onCheckedChange={(v) => setPrefs((p) => ({ ...p, scanAlerts: v }))} />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Weekly Earnings Report</Label>
                                    <p className="text-sm text-muted-foreground">Weekly summary of your commissions.</p>
                                </div>
                                <Switch checked={prefs.weeklyReport} onCheckedChange={(v) => setPrefs((p) => ({ ...p, weeklyReport: v }))} />
                            </div>
                            <Button variant="outline" onClick={savePrefs}>{saved ? 'Saved' : 'Save Preferences'}</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="devices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Linked Plaques & Devices</CardTitle>
                            <CardDescription>Plaques linked to your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plaquesLoading ? (
                                <p className="text-sm text-muted-foreground">Loading plaques…</p>
                            ) : !plaques || plaques.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No plaques linked yet.</p>
                            ) : plaques.map((plaque) => (
                                <div key={plaque.id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            <Smartphone className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{plaque.name}</p>
                                            <p className="text-sm text-muted-foreground">{plaque.status}{plaque.location ? ` • ${plaque.location}` : ''} • {plaque.scans30d} scans (30d)</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Invoices</CardTitle>
                            <CardDescription>Your current subscription.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!subscription ? (
                                <p className="text-sm text-muted-foreground">No active subscription.</p>
                            ) : (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-orange-900">{subscription.tier} Plan</p>
                                            <p className="text-sm text-orange-700 capitalize">
                                                {subscription.status}
                                                {subscription.expiresAt ? ` • renews ${new Date(subscription.expiresAt).toLocaleDateString()}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {subscription.features.length > 0 && (
                                        <ul className="mt-3 space-y-1">
                                            {subscription.features.map((f) => (
                                                <li key={f} className="text-xs text-orange-800">• {f}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                                <div className="flex items-center space-x-4 border p-3 rounded-md">
                                    <CreditCard className="h-5 w-5 text-gray-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Managed via payment provider</p>
                                        <p className="text-xs text-muted-foreground">Card details are handled securely at checkout</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
