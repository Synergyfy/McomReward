'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useGetSeasons, useDeleteSeason } from '@/services/financials';
import { Season } from '@/services/financials/types';
import { AddEditSeasonModal } from './AddEditSeasonModal';

export function SeasonManagement() {
    const { data: seasons, isLoading, error } = useGetSeasons();
    const deleteSeasonMutation = useDeleteSeason();

    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [currentEditSeason, setCurrentEditSeason] = useState<Season | undefined>(undefined);

    const handleAddEditSeason = (season?: Season) => {
        setCurrentEditSeason(season);
        setShowAddEditModal(true);
    };

    const handleDeleteSeason = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this season?')) {
            try {
                await deleteSeasonMutation.mutateAsync(id);
            } catch (err) {
                alert('Failed to delete season. It might be linked to existing tiers.');
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Seasons</h2>
                <Button onClick={() => handleAddEditSeason()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Season</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Visuals</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Loading seasons...</TableCell>
                                </TableRow>
                            )}
                            {error && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-red-500">Error loading seasons.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && seasons?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No seasons found.</TableCell>
                                </TableRow>
                            )}
                            {seasons?.map((season) => (
                                <TableRow key={season.id}>
                                    <TableCell className="font-medium">{season.name}</TableCell>
                                    <TableCell>
                                        {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 items-center">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: season.bgColor, borderColor: season.borderColor }}
                                                title="Background & Border"
                                            />
                                            <span style={{ color: season.textColor }}>Text</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{season.description}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleAddEditSeason(season)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSeason(season.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AddEditSeasonModal
                isOpen={showAddEditModal}
                onClose={() => setShowAddEditModal(false)}
                initialData={currentEditSeason}
            />
        </div>
    );
}
