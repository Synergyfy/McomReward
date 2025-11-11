'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'; // Import Card components
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/lib/mock-data/deals';
import { initialSectors } from '@/lib/mock-data/sectors';
import {
  Tag as TagIcon,
  DollarSign,
  Building,
  Calendar,
  Info, // For description
  CheckCircle, // For featured
  Eye, // For visibility rules
  Clock, // For created/updated at
  Briefcase, // For sector
  User // For submitted by
} from 'lucide-react';

interface ViewDealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | undefined;
}

export function ViewDealDetailsModal({
  isOpen,
  onClose,
  deal,
}: ViewDealDetailsModalProps) {
  if (!deal) return null;

  const sectorName = initialSectors.find(s => s.id === deal.sectorId)?.name || 'N/A';

  const getStatusBadgeVariant = (status: Deal['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'rejected': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <TagIcon className="h-7 w-7 text-primary" /> {deal.title}
          </DialogTitle>
          <DialogDescription>
            Detailed overview of the deal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* General Information Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Deal ID:</span>
                  <span className="text-gray-700">{deal.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Price:</span>
                  <span className="text-gray-700">${deal.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Sector:</span>
                  <span className="text-gray-700">{sectorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Featured:</span>
                  <span className="text-gray-700">{deal.isFeatured ? 'Yes' : 'No'}</span>
                </div>
                {deal.submittedByBusinessId && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Submitted By:</span>
                    <span className="text-gray-700">{deal.submittedByBusinessId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{deal.description}</p>
            </CardContent>
          </Card>

          {/* Status & Rules Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" /> Status & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusBadgeVariant(deal.status)}>{deal.status.replace('_', ' ')}</Badge>
                </div>
                {deal.visibilityRules && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Visibility Rules:</span>
                    <span className="text-gray-700">{deal.visibilityRules}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" /> Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created At:</span>
                  <span className="text-gray-700">{deal.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Updated:</span>
                  <span className="text-gray-700">{deal.updatedAt.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}