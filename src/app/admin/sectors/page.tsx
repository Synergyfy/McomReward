'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateSector } from '@/hooks/useCreateSector';
import { CreateSectorRequest } from '@/types/sectors';

export default function SectorsPage() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const createSectorMutation = useCreateSector();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sectorData: CreateSectorRequest = { name, imageUrl };
    createSectorMutation.mutate(sectorData, {
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

      <Card className="max-w-md">
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
                Image URL
              </label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createSectorMutation.isPending}
              className="w-full"
            >
              {createSectorMutation.isPending ? 'Creating...' : 'Create Sector'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
