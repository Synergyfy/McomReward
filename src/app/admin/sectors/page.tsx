'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateSector, useGetSectors } from '@/services/sectors/hook';
import { CreateSectorRequest } from '@/services/sectors/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';

export default function SectorsPage() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { mutate: createSector, isPending: isCreatingSector } = useCreateSector();
  const { data: sectors, isLoading: isLoadingSectors } = useGetSectors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sectorData: CreateSectorRequest = { name, imageUrl };
    createSector(sectorData, {
      onSuccess: () => {
        alert('Sector created successfully!');
        setName('');
        setImageUrl('');
      },
      onError: (error) => {
        alert(`Error creating sector: ${error.message}`);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Sectors</h1>
        <p className="text-muted-foreground">Create and manage sectors for your platform.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Sector</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Sector Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Restaurants"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                    Image
                  </label>
                  <CloudinaryUpload onUpload={setImageUrl} />
                  {imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Uploaded Image:</p>
                      <Image
                        src={imageUrl}
                        alt="Uploaded sector image"
                        width={100}
                        height={100}
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isCreatingSector}
                  className="w-full"
                >
                  {isCreatingSector ? 'Creating...' : 'Create Sector'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
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
                      <TableHead>Name</TableHead>
                      <TableHead>Image</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors && sectors.map((sector) => (
                      <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.name}</TableCell>
                        <TableCell>
                          <Image
                            src={sector.imageUrl}
                            alt={sector.name}
                            width={50}
                            height={50}
                            className="rounded-md"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
