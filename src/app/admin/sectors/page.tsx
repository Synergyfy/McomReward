'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetSectors } from '@/services/sectors/hook';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import CreateSectorDialog from '@/components/admin/sectors/CreateSectorDialog';

export default function SectorsPage() {
  const { data: sectors, isLoading: isLoadingSectors } = useGetSectors();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Sectors</h1>
        <p className="text-muted-foreground">Create and manage sectors for your platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sectors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSectors ? (
            <p>Loading sectors...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors && sectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell>
                      <div className="relative h-10 w-10">
                        <Image
                          src={sector.imageUrl}
                          alt={sector.name}
                          layout="fill"
                          className="rounded-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateSectorDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />

      <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
}
