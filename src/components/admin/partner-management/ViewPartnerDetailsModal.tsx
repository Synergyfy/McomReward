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
import { Partner } from '@/lib/mock-data/partners';
import {
  Handshake,
  Building,
  CheckCircle,
  XCircle,
  Palette,
  Type,
  Link as LinkIcon,
  DollarSign,
  Users,
  Award,
  BarChart,
  Calendar,
} from 'lucide-react';

interface ViewPartnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | undefined;
}

export function ViewPartnerDetailsModal({
  isOpen,
  onClose,
  partner,
}: ViewPartnerDetailsModalProps) {
  if (!partner) return null;

  const getStatusBadgeVariant = (status: Partner['status']) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Handshake className="h-7 w-7 text-primary" /> {partner.name}
          </DialogTitle>
          <DialogDescription>
            Detailed overview of the partner.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* General Information Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Partner ID:</span>
                  <span className="text-gray-700">{partner.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Type:</span>
                  <span className="text-gray-700">{partner.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusBadgeVariant(partner.status)}>{partner.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Subdomain:</span>
                  <span className="text-gray-700">{partner.subdomain}</span>
                </div>
                {partner.domainRouting && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Custom Domain:</span>
                    <span className="text-gray-700">{partner.domainRouting}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Revenue Sharing:</span>
                  <span className="text-gray-700">{partner.revenueSharing}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding Permissions Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" /> Branding Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2">
                  {partner.brandingPermissions.logo ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-medium">Logo Customization</span>
                </div>
                <div className="flex items-center gap-2">
                  {partner.brandingPermissions.colors ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-medium">Color Scheme Customization</span>
                </div>
                <div className="flex items-center gap-2">
                  {partner.brandingPermissions.textLock ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-medium">Text Lock (Content Editing)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart className="h-5 w-5 text-muted-foreground" /> Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partner.performanceMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Users:</span>
                    <span className="text-gray-700">{partner.performanceMetrics.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Rewards Claimed:</span>
                    <span className="text-gray-700">{partner.performanceMetrics.totalRewardsClaimed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Revenue Generated:</span>
                    <span className="text-gray-700">${partner.performanceMetrics.revenueGenerated.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Performance metrics not available or tracking not enabled for this partner. (Future Enhancement)</p>
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
                  <span className="text-gray-700">{partner.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Updated:</span>
                  <span className="text-gray-700">{partner.updatedAt.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
