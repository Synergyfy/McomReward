'use client';

import React, { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Tag, Users, Building, MapPin, Clock, Calendar, History, Scan } from 'lucide-react';
import { useGetAdminQrPlaques } from '@/services/qr-plaques/hook';
import { QrPlaque } from '@/services/qr-plaques/types';
import LoadingSpinner from '@/components/ui/Loading';
import { notFound } from 'next/navigation';

interface PlaqueDetailsPageProps {
  params: Promise<{
    plaqueId: string;
  }>;
}

const getStatusBadgeVariant = (status: QrPlaque['status']) => {
  switch (status) {
    case 'ACTIVE': return 'default';
    case 'SOLD': return 'success';
    case 'RETIRED': return 'secondary';
    case 'LOST': return 'destructive';
    case 'INACTIVE': return 'outline';
    default: return 'outline';
  }
};

export default function PlaqueDetailsPage({ params }: PlaqueDetailsPageProps) {
  const { plaqueId } = use(params);
  const { data, isLoading } = useGetAdminQrPlaques({ limit: 1000 });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const plaque = (data || []).find(p => p.id === plaqueId);

  if (!plaque) {
    notFound(); // Render 404 page if plaque not found
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plaque Details: {plaque.name}</h1>
        <p className="text-muted-foreground">Comprehensive information about Plaque ID: {plaque.id}</p>
      </div>

      <div className="grid gap-6 py-4">
        {/* General Information Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-muted-foreground" /> General Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Plaque ID:</span>
                <span className="text-gray-700">{plaque.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span className="text-gray-700">{plaque.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Group:</span>
                <span className="text-gray-700">{plaque.groupName || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Owner:</span>
                <span className="text-gray-700">{plaque.ownerName || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Content URL:</span>
                <span className="text-gray-700">{plaque.contentUrl || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span>
                <Badge variant={getStatusBadgeVariant(plaque.status)}>{plaque.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" /> Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{plaque.description || 'No description available.'}</p>
          </CardContent>
        </Card>

        {/* QR Code and Scan Counts Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Scan className="h-5 w-5 text-muted-foreground" /> QR Code & Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm items-center">
            <div className="flex flex-col items-center space-y-2">
              <p className="font-medium">QR Code:</p>
              {plaque.qrCodeUrl ? (
                <img src={plaque.qrCodeUrl} alt={`QR Code for ${plaque.name}`} className="w-40 h-40 border p-2" />
              ) : (
                <p className="text-muted-foreground text-xs">No QR image available.</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Scan Counts:</span>
                <span className="text-gray-700">{(plaque.scans || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Redemptions:</span>
                <span className="text-gray-700">{(plaque.redemptions || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Updated:</span>
                <span className="text-gray-700">{plaque.updatedAt ? new Date(plaque.updatedAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" /> Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created At:</span>
                <span className="text-gray-700">{plaque.createdAt ? new Date(plaque.createdAt).toLocaleString() : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Updated:</span>
                <span className="text-gray-700">{plaque.updatedAt ? new Date(plaque.updatedAt).toLocaleString() : '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}