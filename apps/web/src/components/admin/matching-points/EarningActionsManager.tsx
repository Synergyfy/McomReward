'use client';

import React, { useState } from 'react';
import { useGetEarningActions, useCreateEarningAction, useUpdateEarningAction } from '@/services/matching-points/hook';
import { EarningAction, CreateEarningActionDto } from '@/services/matching-points/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const EarningActionsManager = () => {
    const { data: actions, isLoading } = useGetEarningActions();
    const { mutate: createAction, isPending: isCreating } = useCreateEarningAction();
    const { mutate: updateAction, isPending: isUpdating } = useUpdateEarningAction();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAction, setEditingAction] = useState<EarningAction | null>(null);
    const [formData, setFormData] = useState<Partial<CreateEarningActionDto>>({
        isActive: true,
        actionParameters: {}
    });

    // Helper state for simplifying Action Parameters UI
    const [limitType, setLimitType] = useState<'none' | 'once_lifetime' | 'daily'>('none');
    const [dailyLimit, setDailyLimit] = useState<number>(1);

    const SYSTEM_KEYS = [
        { value: 'LOGIN_DAILY', label: 'Daily Login', desc: 'Triggers when a user logs in (limit daily).' },
        { value: 'REGISTRATION', label: 'Registration', desc: 'Triggers on new signup.' },
        { value: 'PROFILE_COMPLETE', label: 'Profile Completion', desc: 'Triggers when profile is 100% full.' },
        { value: 'CAMPAIGN_JOIN', label: 'Join Campaign', desc: 'Triggers when joining a new campaign.' },
        { value: 'PURCHASE', label: 'Purchase/Redemption', desc: 'Triggers after a successful deal redemption.' },
        { value: 'REFERRAL_SUCCESS', label: 'Referral Success', desc: 'Triggers when an invited friend joins.' },
        { value: 'APP_OPEN', label: 'App Open', desc: 'Triggers when the app is opened.' },
        { value: 'STREAK_7_DAY', label: '7-Day Streak', desc: 'Triggers on 7th consecutive active day.' },
    ];

    const handleOpenCreate = () => {
        setEditingAction(null);
        setFormData({ isActive: true, actionParameters: {} });
        setLimitType('none');
        setDailyLimit(1);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (action: EarningAction) => {
        setEditingAction(action);
        setFormData({
            name: action.name,
            key: action.key,
            points: action.points,
            description: action.description,
            isActive: action.isActive,
            actionParameters: action.actionParameters || {}
        });

        // Parse actionParameters to set simplified UI state
        if (action.actionParameters?.once_lifetime) {
            setLimitType('once_lifetime');
        } else if (action.actionParameters?.daily) {
            setLimitType('daily');
            setDailyLimit(Number(action.actionParameters.daily));
        } else {
            setLimitType('none');
        }

        setIsModalOpen(true);
    };

    // Update actionParameters whenever limit UI changes
    React.useEffect(() => {
        let newParams = {};
        if (limitType === 'once_lifetime') {
            newParams = { once_lifetime: true };
        } else if (limitType === 'daily') {
            newParams = { daily: dailyLimit };
        }
        setFormData(prev => ({ ...prev, actionParameters: newParams }));
    }, [limitType, dailyLimit]);

    const handleSave = () => {
        if (!formData.name || !formData.key || formData.points === undefined) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const payload = {
            name: formData.name,
            key: formData.key,
            points: Number(formData.points),
            description: formData.description,
            isActive: formData.isActive,
            actionParameters: formData.actionParameters
        } as CreateEarningActionDto;

        if (editingAction) {
            updateAction({ id: editingAction.id, ...payload }, {
                onSuccess: () => {
                    toast.success("Rule updated successfully");
                    setIsModalOpen(false);
                },
                onError: () => toast.error("Failed to update rule")
            });
        } else {
            createAction(payload, {
                onSuccess: () => {
                    toast.success("Rule created successfully");
                    setIsModalOpen(false);
                },
                onError: () => toast.error("Failed to create rule")
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Earning Actions
                    </CardTitle>
                    <CardDescription>Define how participants earn matching points.</CardDescription>
                </div>
                <Button onClick={handleOpenCreate} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> New Rule
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {actions?.map((action) => (
                                <TableRow key={action.id}>
                                    <TableCell className="font-medium">
                                        {action.name}
                                        {action.description && <p className="text-xs text-muted-foreground">{action.description}</p>}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{action.key}</Badge></TableCell>
                                    <TableCell>{action.points}</TableCell>
                                    <TableCell>
                                        <Badge variant={action.isActive ? "default" : "secondary"}>
                                            {action.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(action)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!actions || actions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No earning rules defined yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingAction ? 'Edit Earning Rule' : 'Create Earning Rule'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Daily Login Bonus"
                                />
                                <p className="text-xs text-muted-foreground">Human-readable name for this rule.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">System Key</Label>
                            <div className="col-span-3 space-y-1">
                                <Select
                                    value={formData.key}
                                    onValueChange={(val) => setFormData({ ...formData, key: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a trigger event" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]">
                                        {SYSTEM_KEYS.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                <span className="font-medium">{s.label}</span>
                                                <span className="text-xs text-muted-foreground ml-2">({s.value})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.key && (
                                    <p className="text-xs text-muted-foreground">
                                        {SYSTEM_KEYS.find(k => k.value === formData.key)?.desc}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="points" className="text-right">Points</Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="points"
                                    type="number"
                                    value={formData.points ?? 0}
                                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-muted-foreground">Base matching points to award.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <div className="col-span-3 space-y-1">
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Internal note about this rule..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Frequency Limit</Label>
                            <div className="col-span-3 space-y-3 p-3 border rounded-md bg-muted/20">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="once"
                                        checked={limitType === 'once_lifetime'}
                                        onCheckedChange={(checked) => setLimitType(checked ? 'once_lifetime' : 'none')}
                                    />
                                    <Label htmlFor="once" className="font-normal">Once per Lifetime</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="daily"
                                        checked={limitType === 'daily'}
                                        onCheckedChange={(checked) => setLimitType(checked ? 'daily' : 'none')}
                                    />
                                    <Label htmlFor="daily" className="font-normal">Daily Limit</Label>
                                </div>

                                {limitType === 'daily' && (
                                    <div className="pl-6 pt-1 flex items-center gap-2">
                                        <span className="text-sm">Max</span>
                                        <Input
                                            type="number"
                                            className="w-20 h-8"
                                            value={dailyLimit}
                                            onChange={(e) => setDailyLimit(parseInt(e.target.value) || 1)}
                                            min={1}
                                        />
                                        <span className="text-sm">times per day</span>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground pt-1">
                                    {limitType === 'none' && "No limits - triggers every time the event occurs."}
                                    {limitType === 'once_lifetime' && "User can only earn this ONCE forever."}
                                    {limitType === 'daily' && `User can earn this ${dailyLimit} time(s) every 24 hours.`}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Status</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({ ...formData, isActive: c })} />
                                <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Rule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
