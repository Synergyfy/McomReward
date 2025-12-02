'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Tag, Users, Building, MapPin, Clock, Calendar, History, Scan } from 'lucide-react';
import { mockPlaques, Plaque } from '@/lib/mock-data/plaques';
import { notFound } from 'next/navigation';

interface PlaqueDetailsPageProps {
  params: {
    plaqueId: string;
  };
}

export default function PlaqueDetailsPage({ params }: PlaqueDetailsPageProps) {
  const { plaqueId } = params;
  const plaque = mockPlaques.find(p => p.id === plaqueId);

  if (!plaque) {
    notFound(); // Render 404 page if plaque not found
  }

  const getStatusBadgeVariant = (status: Plaque['status']) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Sold': return 'success';
      case 'Retired': return 'secondary';
      case 'Lost': return 'destructive';
      case 'Inactive': return 'outline';
      default: return 'outline';
    }
  };

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
                <span className="text-gray-700">{plaque.groupName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Owner:</span>
                <span className="text-gray-700">{plaque.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location Details:</span>
                <span className="text-gray-700">{plaque.locationDetails}</span>
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
            <p className="text-gray-700">{plaque.description}</p>
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
              <img src={plaque.qrCodeData} alt={`QR Code for ${plaque.name}`} className="w-40 h-40 border p-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Scan Counts:</span>
                <span className="text-gray-700">{plaque.scanCounts.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Scan Time:</span>
                <span className="text-gray-700">{plaque.lastScanTime ? plaque.lastScanTime.toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfer History Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" /> Transfer History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plaque.transferHistory && plaque.transferHistory.length > 0 ? (
              <div className="space-y-2 text-sm">
                {plaque.transferHistory.map((transfer, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <p><span className="font-medium">From:</span> {transfer.fromOwnerName} ({transfer.fromOwnerId})</p>
                    <p><span className="font-medium">To:</span> {transfer.toOwnerName} ({transfer.toOwnerId})</p>
                    <p><span className="font-medium">Date:</span> {transfer.transferDate.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No transfer history available.</p>
            )}
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
                <span className="text-gray-700">{plaque.createdAt.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Updated:</span>
                <span className="text-gray-700">{plaque.updatedAt.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
