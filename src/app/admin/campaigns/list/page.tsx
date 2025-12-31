'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useGetAdminCampaigns, useDeleteCampaign } from '@/services/campaigns/hook';
import { CampaignResponse } from '@/services/campaigns/types';
import LoadingSpinner from '@/components/ui/Loading';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

export default function AdminCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // You can adjust the limit as needed
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetAdminCampaigns(page, limit);
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
  const campaigns = data?.data || [];

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign: CampaignResponse) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.campaignMessage && campaign.campaignMessage.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [searchTerm, campaigns]);

  const isValidUrl = (url: string | null | undefined) => {
    if (!url) return false;
    return url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:');
  };

  const handleDeleteClick = (id: string) => {
    setDeleteCampaignId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteCampaignId) {
      deleteCampaign(deleteCampaignId, {
        onSuccess: () => {
          toast.success('Campaign deleted successfully');
          setDeleteCampaignId(null);
        },
        onError: (error) => {
          console.error('Failed to delete campaign:', error);
          toast.error('Failed to delete campaign');
          setDeleteCampaignId(null);
        }
      });
    }
  };

  const formatCampaignType = (type: string) => {
    if (!type) return 'N/A';
    switch (type.toLowerCase()) {
      case 'qr_code':
        return 'QR Code';
      case 'referral':
        return 'Referral';
      case 'social_or_email':
        return 'Social or Email';
      case 'special_occasion':
        return 'Special Occasion';
      default:
        return type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    }
  };

  const formatAudienceType = (type: string) => {
    if (!type) return 'N/A';
    switch (type.toLowerCase()) {
      case 'all':
        return 'All';
      case 'members':
        return 'Members';
      case 'badge_level':
        return 'Badge Level';
      case 'target_wishlist':
        return 'Target Wishlist';
      default:
        return type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>Error fetching campaigns.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Campaigns</h1>
            <p className="text-gray-600">Manage and create loyalty campaigns for the platform.</p>
          </div>
          <Link href="/admin/campaigns/create">
            <Button>Create New Campaign</Button>
          </Link>
        </div>

        <div className="mb-8">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No campaigns found. Create your first campaign!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign: CampaignResponse) => (
              <Card key={campaign.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  {isValidUrl(campaign.bannerUrl) && (
                    <Image src={campaign.bannerUrl} alt={campaign.name} layout="fill" objectFit="cover" />
                  )}
                  <Badge variant={!campaign.disabled ? 'default' : 'secondary'} className="absolute top-3 right-3 text-sm px-3 py-1">
                    {!campaign.disabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="relative px-5">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
                      {isValidUrl(campaign.logoUrl) ? (
                        <Image src={campaign.logoUrl} alt={`${campaign.name} Logo`} layout="fill" objectFit="cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          <span className="text-xs">Logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 p-5 text-center">
                  <h5 className="font-extrabold text-xl text-gray-900 mb-2 truncate">{campaign.name}</h5>
                  <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">{campaign.campaignMessage}</p>

                  {campaign.targetTiers?.some(t => t.type === 'seasonal') && (
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {Array.from(new Set(campaign.targetTiers
                        .filter(t => t.type === 'seasonal' && t.season)
                        .map(t => JSON.stringify(t.season))))
                        .map((sJson: any) => {
                          const season = JSON.parse(sJson);
                          return (
                            <TooltipProvider key={season.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="cursor-help bg-blue-50 text-blue-700 border-blue-200">
                                    {season.name}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-800 my-5 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="font-semibold text-right">{formatCampaignType(campaign.campaignType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Audience:</span>
                      <span className="font-semibold text-right">{formatAudienceType(campaign.audienceType)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/campaigns/${campaign.id}/overview`} className="flex-1">
                      <Button className="w-full py-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                        View Campaign
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(campaign.id)}
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteCampaignId} onOpenChange={(open) => !open && setDeleteCampaignId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the campaign.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
