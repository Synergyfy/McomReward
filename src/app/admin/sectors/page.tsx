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
    <div>
      <h1 className="text-2xl font-bold mb-5 text-primary">Sectors</h1>
      <p className="mb-5">Manage sectors for the loyalty platform.</p>

      <Card className="max-w-md mb-10">
        <CardHeader>
          <CardTitle>Create New Sector</CardTitle>
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
                placeholder="Enter sector name"
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

      <h2 className="text-xl font-bold mb-5">All Sectors</h2>

      {isLoadingSectors ? (
        <p>Loading sectors...</p>
      ) : (
        <Card>
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
                  <TableCell>{sector.name}</TableCell>
                  <TableCell>
                    <Image
                      src={sector.imageUrl}
                      alt={sector.name}
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
