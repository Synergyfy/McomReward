'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/services/deals/types';
import {
  Tag as TagIcon,
  DollarSign,
  Building,
  Calendar,
  Info,
  CheckCircle,
  Clock,
  Briefcase,
  FileText
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'declined': return 'destructive';
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
                  <span className="font-medium">Value:</span>
                  <span className="text-gray-700">£{Number(deal.value || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <span className="text-gray-700">{deal.category?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Approved:</span>
                  <span className="text-gray-700">{deal.isApproved ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Business:</span>
                  <span className="text-gray-700">{deal.business?.name || 'N/A'}</span>
                </div>
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

           {/* Terms Card */}
           <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" /> Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{deal.termsAndConditions}</p>
            </CardContent>
          </Card>

          {/* Status & Dates Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" /> Status & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusBadgeVariant(deal.status)}>{deal.status}</Badge>
                </div>
                 <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Active:</span>
                  <span className="text-gray-700">{deal.isActive ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Start Date:</span>
                  <span className="text-gray-700">{deal.startDate ? new Date(deal.startDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">End Date:</span>
                  <span className="text-gray-700">{deal.endDate ? new Date(deal.endDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                 <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created At:</span>
                  <span className="text-gray-700">{new Date(deal.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
