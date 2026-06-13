'use client';

import React, { useState } from 'react';
import { useGetParticipantBadges, useCreateParticipantBadge, useUpdateParticipantBadge } from '@/services/matching-points/hook';
import { ParticipantBadge, CreateParticipantBadgeDto } from '@/services/matching-points/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Award, Trophy } from 'lucide-react'; // Using Trophy for badges
import { toast } from 'sonner';

export const ParticipantBadgesManager = () => {
    const { data: badges, isLoading } = useGetParticipantBadges();
    const { mutate: createBadge, isPending: isCreating } = useCreateParticipantBadge();
    const { mutate: updateBadge, isPending: isUpdating } = useUpdateParticipantBadge();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState<ParticipantBadge | null>(null);
    const [formData, setFormData] = useState<Partial<CreateParticipantBadgeDto>>({
        multiplier: 1.0,
        benefits: [],
        color: '#000000'
    });
    const [benefitsString, setBenefitsString] = useState("");

    const handleOpenCreate = () => {
        setEditingBadge(null);
        setFormData({ multiplier: 1.0, benefits: [], color: '#000000' });
        setBenefitsString("");
        setIsModalOpen(true);
    };

    const handleOpenEdit = (badge: ParticipantBadge) => {
        setEditingBadge(badge);
        setFormData({
            name: badge.name,
            minPoints: badge.minPoints,
            priority: badge.priority,
            multiplier: badge.multiplier,
            benefits: badge.benefits,
            color: badge.color
        });
        setBenefitsString(badge.benefits.join('\n'));
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || formData.minPoints === undefined || formData.priority === undefined) {
            toast.error("Please fill in all required fields (Name, Min Points, Priority).");
            return;
        }

        const payload = {
            name: formData.name,
            minPoints: Number(formData.minPoints),
            priority: Number(formData.priority),
            multiplier: Number(formData.multiplier || 1.0),
            color: formData.color,
            benefits: benefitsString.split('\n').filter(b => b.trim() !== '')
        } as CreateParticipantBadgeDto;

        if (editingBadge) {
            updateBadge({ id: editingBadge.id, ...payload }, {
                onSuccess: () => {
                    toast.success("Badge updated successfully");
                    setIsModalOpen(false);
                },
                onError: () => toast.error("Failed to update badge")
            });
        } else {
            createBadge(payload, {
                onSuccess: () => {
                    toast.success("Badge created successfully");
                    setIsModalOpen(false);
                },
                onError: () => toast.error("Failed to create badge")
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-orange-500" />
                        Participant Badges
                    </CardTitle>
                    <CardDescription>Define badge levels and their multipliers based on points.</CardDescription>
                </div>
                <Button onClick={handleOpenCreate} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> New Badge
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Color</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Level Name</TableHead>
                                <TableHead>Min Points</TableHead>
                                <TableHead>Multiplier</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Sort by priority desc for display usually, but table might just show default order */}
                            {badges?.sort((a, b) => a.priority - b.priority).map((badge) => (
                                <TableRow key={badge.id}>
                                    <TableCell>
                                        <div
                                            className="w-6 h-6 rounded-full border shadow-sm"
                                            style={{ backgroundColor: badge.color }}
                                            title={badge.color}
                                        />
                                    </TableCell>
                                    <TableCell>{badge.priority}</TableCell>
                                    <TableCell className="font-semibold">{badge.name}</TableCell>
                                    <TableCell>{badge.minPoints.toLocaleString()}</TableCell>
                                    <TableCell>x{badge.multiplier}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(badge)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!badges || badges.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No badges defined yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingBadge ? 'Edit Badge Level' : 'Create Badge Level'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="levelName" className="text-right">Name</Label>
                            <div className="col-span-3 space-y-1">
                                <Input id="levelName" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Gold" />
                                <p className="text-xs text-muted-foreground">The visible name of this tier.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">Priority</Label>
                            <div className="col-span-3 space-y-1">
                                <Input id="priority" type="number" value={formData.priority || ''} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} placeholder="1 = Lowest" />
                                <p className="text-xs text-muted-foreground">Higher numbers mean higher status (1=lowest).</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="minPoints" className="text-right">Min Points</Label>
                            <div className="col-span-3 space-y-1">
                                <Input id="minPoints" type="number" value={formData.minPoints || 0} onChange={(e) => setFormData({ ...formData, minPoints: parseInt(e.target.value) })} />
                                <p className="text-xs text-muted-foreground">Total points needed to unlock this badge.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="multiplier" className="text-right">Multiplier</Label>
                            <div className="col-span-3 space-y-1">
                                <Input id="multiplier" type="number" step="0.1" value={formData.multiplier || 1.0} onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })} />
                                <p className="text-xs text-muted-foreground">Bonus point multiplier (1.0 = normal, 1.5 = +50%).</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="color" className="text-right">Color Hex</Label>
                            <div className="col-span-3 space-y-1">
                                <div className="flex gap-2">
                                    <Input id="color" value={formData.color || '#000000'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                                    <div className="w-10 h-10 rounded border shrink-0" style={{ backgroundColor: formData.color || '#000000' }} />
                                </div>
                                <p className="text-xs text-muted-foreground">Badge background color.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="benefits" className="text-right pt-2">Benefits</Label>
                            <div className="col-span-3 space-y-1">
                                <Textarea
                                    id="benefits"
                                    value={benefitsString}
                                    onChange={(e) => setBenefitsString(e.target.value)}
                                    placeholder="One benefit per line"
                                    rows={4}
                                />
                                <p className="text-xs text-muted-foreground">List perks one per line.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Badge'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
