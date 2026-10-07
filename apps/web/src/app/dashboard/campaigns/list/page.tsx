'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import Link from 'next/link';
import { ClaimableCampaignsTicker } from '@/components/customer/ClaimableCampaignsTicker';
import { PlusCircle, Pencil, ChevronLeft, ChevronRight, MoreHorizontal, Lock, QrCode, Copy, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { differenceInDays, parseISO, isValid } from 'date-fns';

// Imports moved up and consolidated
import { useGetBusinessTierUsage, useGetBusinessProfile } from '@/services/business/hook';
import { useGetGeneralAnalytics } from '@/services/business-dashboard/hook';
import { useGetMySubscription } from '@/services/tiers/hook';
import UsageCard from '@/components/dashboard/shared/UsageCard';

import { useGetMyCreatedCampaigns, useGetMyClaimedCampaigns, useGetClaimableCampaigns, useDeleteCampaign } from '@/services/campaigns/hook';
import ClaimCampaignModal from '@/components/dashboard/campaigns/ClaimCampaignModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import { PublicCampaignResponse } from '@/services/campaigns/types';
import api from '@/services/api';

import QRCodeModal from '@/components/dashboard/campaigns/QRCodeModal';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) => {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const ellipsis = <MoreHorizontal className="h-4 w-4" />;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="icon"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      items.push(
        <Button
          key={1}
          variant={currentPage === 1 ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );

      if (currentPage > 3) {
        items.push(
          <div
            key="start-ellipsis"
            className="flex items-center justify-center w-8 h-8 text-muted-foreground"
          >
            {ellipsis}
          </div>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="icon"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <div
            key="end-ellipsis"
            className="flex items-center justify-center w-8 h-8 text-muted-foreground"
          >
            {ellipsis}
          </div>
        );
      }

      items.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between mt-8 border-t pt-4">
      <div className="text-sm text-gray-500 hidden sm:block">
        Showing {(currentPage - 1) * limit + 1} to{' '}
        {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
      </div>
      <div className="flex items-center space-x-2 mx-auto sm:mx-0">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {renderPaginationItems()}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function CampaignsListPage() {
  const router = useRouter();
  const [createdPage, setCreatedPage] = useState(1);
  const [claimedPage, setClaimedPage] = useState(1);
  const limit = 9;
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedCampaignForQR, setSelectedCampaignForQR] = useState<{ id: string, name: string } | null>(null);

  const { data: createdCampaignsData, isLoading: isLoadingCreated } = useGetMyCreatedCampaigns(createdPage, limit);
  const { data: claimedCampaignsData, isLoading: isLoadingClaimed } = useGetMyClaimedCampaigns(claimedPage, limit);
  const { data: claimableCampaignsData } = useGetClaimableCampaigns(1, 20);
  const { data: tierUsageData, isLoading: isLoadingTierUsage } = useGetBusinessTierUsage();
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useGetMySubscription();
  const { data: analyticsData } = useGetGeneralAnalytics();
  const { data: profile } = useGetBusinessProfile();
  const { mutate: deleteCampaign } = useDeleteCampaign();

  const handleDeleteCampaign = async (campaign: PublicCampaignResponse) => {
    // 1. Confirmation
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    // 2. Participant Check
    try {
      const analytics = await api.get(`/business/campaigns/${campaign.id}/analytics/detailed`);
      const totalParticipants = parseInt(analytics.data.totalParticipants || '0');

      if (totalParticipants > 0) {
        toast.error("A user joined, can't delete");
        return;
      }
    } catch (error) {
       console.error("Error checking participants", error);
    }

    // 3. Ongoing Check
    const startDate = new Date(campaign.start_date);
    const now = new Date();
    const endDate = new Date(campaign.end_date);

    // Logic: If started AND NOT expired, it is ongoing.
    if (startDate < now && endDate > now) {
      toast.error("Can't delete, campaign is ongoing");
      return;
    }

    // 4. Delete
    deleteCampaign(campaign.id, {
      onSuccess: () => {
        toast.success("Campaign deleted successfully");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to delete campaign");
      }
    });
  };

  const handleOpenQRModal = (campaignId: string, campaignName: string) => {
    setSelectedCampaignForQR({ id: campaignId, name: campaignName });
    setIsQRModalOpen(true);
  };

  const handleCopyLink = (campaignId: string) => {
    const campaignUrl = `${window.location.origin}/campaigns/${campaignId}`;
    navigator.clipboard.writeText(campaignUrl).then(
      () => {
        setCopiedCampaignId(campaignId);
        setTimeout(() => setCopiedCampaignId(null), 2000); // Hide message after 2 seconds
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  const handleCreateFromScratch = useCallback(() => {
    setIsClaimModalOpen(false);
    router.push('/dashboard/campaigns/create');
  }, []);

  const filterCampaigns = (campaigns: PublicCampaignResponse[] | undefined) => {
    if (!campaigns) return [];
    return campaigns.filter(campaign => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.campaign_message
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredCreatedCampaigns = useMemo(() => filterCampaigns(createdCampaignsData?.data), [searchTerm, createdCampaignsData]);
  const filteredClaimedCampaigns = useMemo(() => filterCampaigns(claimedCampaignsData?.data), [searchTerm, claimedCampaignsData]);

  // Check if user has reached their campaign limit
  const maxActiveCampaigns = subscriptionData?.tier?.configuration?.quotas?.maxActiveCampaigns ?? 0;
  const currentActiveCampaigns = tierUsageData?.features?.campaigns?.used ?? 0;
  // Bypass limit for Super Business
  const hasReachedCampaignLimit = !profile?.isSuperBusiness && (maxActiveCampaigns !== -1 && currentActiveCampaigns >= maxActiveCampaigns);

  // New helper function to get all applicable status badges
  const getCampaignBadges = (campaign: PublicCampaignResponse): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[] => {
    const badges: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[] = [];
    const now = new Date();

    // Robustly retrieve dates (handle both snake_case and camelCase)
    // @ts-ignore - checking potential camelCase props not in interface
    const rawStartDate = campaign.start_date || campaign.startDate;
    // @ts-ignore
    const rawEndDate = campaign.end_date || campaign.endDate;

    // Check for missing dates
    if (!rawStartDate || !rawEndDate) {
      badges.push({ label: 'No Date', variant: 'outline' });
      return badges;
    }

    const startDate = parseISO(rawStartDate);
    const endDate = parseISO(rawEndDate);

    if (!isValid(startDate) || !isValid(endDate)) {
       badges.push({ label: 'Invalid Date', variant: 'outline' });
       return badges;
    }

    if (campaign.disabled) {
      badges.push({ label: 'Disabled', variant: 'destructive' });
      return badges; // Disabled overrides everything else? Or should we show other status? Usually disabled hides status.
    }

    // Use remainingSlots if available, otherwise quantity
    const available = campaign.remainingSlots ?? campaign.quantity;
    if (available <= 0) {
      badges.push({ label: 'Sold Out', variant: 'destructive' });
      return badges;
    }

    if (startDate > now) {
      badges.push({ label: 'Scheduled', variant: 'secondary' });
      return badges;
    }

    if (endDate < now) {
      badges.push({ label: 'Expired', variant: 'secondary' });
      return badges;
    }

    // If we are here, it is Active
    badges.push({ label: 'Active', variant: 'default' });

    // Days remaining check (Only for Active campaigns)
    // We use differenceInDays which returns integer days.
    // If it's today (0) or future up to 7 days.
    const daysLeft = differenceInDays(endDate, now);
    if (daysLeft >= 0 && daysLeft <= 7) {
       badges.push({ label: `${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left`, variant: 'destructive' });
    }

    return badges;
  };

  const renderCampaigns = (campaigns: PublicCampaignResponse[], isLoading: boolean) => {
    // ... loading / empty states ...

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading campaigns...</p>
        </div>
      );
    }

    if (campaigns.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No campaigns found.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
        {campaigns.map(campaign => (
          <Card
            key={campaign.id}
            className="p-0 py-0 gap-0 bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-gray-200 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            onClick={() => router.push(`/dashboard/campaigns/edit/${campaign.id}`)}
          >
            <div>
              <div className="relative h-28 sm:h-44 w-full overflow-hidden bg-gray-200">
                {(campaign.banner_url || campaign.bannerUrl) && (
                  <Image
                    src={campaign.banner_url || campaign.bannerUrl || ''}
                    alt={campaign.name}
                    layout="fill"
                    objectFit="cover"
                  />
                )}
                {/* Badges Container */}
                <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex flex-row gap-1 items-center">
                  {getCampaignBadges(campaign).map((badge, idx) => (
                    <Badge
                      key={idx}
                      variant={badge.variant}
                      className="text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-0 sm:py-0.5 shadow-sm font-semibold"
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative px-2 sm:px-4">
                <div className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2">
                  <div className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 sm:border-4 border-white bg-gray-300 shadow-md">
                    {(campaign.logo_url || campaign.logoUrl) ? (
                      <Image
                        src={campaign.logo_url || campaign.logoUrl || ''}
                        alt={`${campaign.name} Logo`}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500">
                        <span className="text-[10px] sm:text-xs">Logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="pt-8 sm:pt-12 p-2.5 sm:p-4 text-center">
                <h5 className="font-extrabold text-xs sm:text-lg text-gray-900 mb-1 truncate">
                  {campaign.name}
                </h5>
                <p className="text-gray-600 text-[10px] sm:text-xs mb-2 h-4 sm:h-8 overflow-hidden line-clamp-1 sm:line-clamp-2">
                  {campaign.campaign_message}
                </p>

                <div className="space-y-1 text-[10px] sm:text-xs text-gray-800 my-2 sm:my-3 border-t pt-2">
                  {(() => {
                    const rewardsList = (campaign.businessRewards && campaign.businessRewards.length > 0)
                      ? campaign.businessRewards
                      : (campaign.rewards || []);

                    return (
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-medium text-gray-500 shrink-0">
                          {rewardsList.length > 1 ? 'Rewards:' : 'Reward:'}
                        </span>
                        <div className="flex flex-col text-right truncate">
                          {rewardsList.length > 0 ? (
                            rewardsList.slice(0, 1).map((reward) => (
                              <span key={reward.id} className="font-semibold block truncate">
                                {reward.title}
                              </span>
                            ))
                          ) : (
                            <span className="font-semibold">N/A</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Available:
                    </span>
                    <span className="font-semibold text-right">
                      {campaign.remainingSlots ?? campaign.quantity}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Action Buttons Grid (Single even line of 5 touch buttons) */}
            <div className="p-2 sm:p-3 pt-0">
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="h-7 sm:h-8 w-full border-orange-600 text-orange-600 hover:bg-orange-50 rounded-md"
                  title="View Campaign"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/dashboard/campaigns/${campaign.id}`} className="flex items-center justify-center">
                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="h-7 sm:h-8 w-full border-orange-600 text-orange-600 hover:bg-orange-50 rounded-md"
                  title="Edit Campaign"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/dashboard/campaigns/edit/${campaign.id}`} className="flex items-center justify-center">
                    <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 sm:h-8 w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink(campaign.id);
                  }}
                  title="Copy Link"
                >
                  {copiedCampaignId === campaign.id ? (
                    <span className="text-green-600 font-bold text-[10px]">✓</span>
                  ) : (
                    <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 sm:h-8 w-full border-purple-600 text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenQRModal(campaign.id, campaign.name);
                  }}
                  title="Generate QR Code"
                >
                  <QrCode className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 sm:h-8 w-full border-red-500 text-red-600 hover:bg-red-50 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCampaign(campaign);
                  }}
                  title="Delete Campaign"
                >
                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Campaigns</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5">Manage and create your loyalty campaigns.</p>
            </div>
            <Button
              onClick={() => setIsClaimModalOpen(true)}
              disabled={hasReachedCampaignLimit}
              className={`w-full sm:w-auto h-10 text-sm font-semibold ${hasReachedCampaignLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {hasReachedCampaignLimit ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Limit Reached
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Campaign
                </>
              )}
            </Button>
          </div>

          <div>
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm h-10 sm:h-11 bg-white shadow-sm border-gray-200 rounded-xl text-sm"
            />
          </div>

          <ClaimableCampaignsTicker />

          {isLoadingTierUsage || isLoadingSubscription ? (
             <div className="max-w-md h-24 bg-gray-200 animate-pulse rounded-xl"></div>
          ) : (tierUsageData || subscriptionData) ? (
            <div className="max-w-md">
              <UsageCard
                title="Campaign Usage"
                usage={profile?.isSuperBusiness ? {
                  limit: -1,
                  used: analyticsData?.totalActiveCampaigns || 0,
                  remaining: -1,
                  extraPoints: 0
                } : (tierUsageData?.features?.campaigns || {
                  limit: subscriptionData?.tier?.configuration?.quotas?.maxActiveCampaigns ?? 0,
                  used: 0,
                  remaining: subscriptionData?.tier?.configuration?.quotas?.maxActiveCampaigns ?? 0,
                  extraPoints: 0
                })}
              />
            </div>
          ) : null}

          <Tabs defaultValue="created" className="w-full">
            <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-2 p-1 bg-white shadow-sm rounded-xl">
              <TabsTrigger value="created" className="text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                My Created Campaigns
              </TabsTrigger>
              <TabsTrigger value="claimed" className="text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                My Claimed Campaigns
              </TabsTrigger>
            </TabsList>
            <TabsContent value="created">
              {renderCampaigns(filteredCreatedCampaigns, isLoadingCreated)}
              {createdCampaignsData && createdCampaignsData.total > 0 && (
                <Pagination
                  currentPage={createdPage}
                  totalPages={createdCampaignsData.totalPages || 1}
                  totalItems={createdCampaignsData.total || 0}
                  limit={limit}
                  onPageChange={setCreatedPage}
                />
              )}
            </TabsContent>
            <TabsContent value="claimed">
              {renderCampaigns(filteredClaimedCampaigns, isLoadingClaimed)}
              {claimedCampaignsData && claimedCampaignsData.total > 0 && (
                <Pagination
                  currentPage={claimedPage}
                  totalPages={claimedCampaignsData.totalPages || 1}
                  totalItems={claimedCampaignsData.total || 0}
                  limit={limit}
                  onPageChange={setClaimedPage}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ClaimCampaignModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        claimableCampaigns={claimableCampaignsData?.data || []}
        onCreateFromScratch={handleCreateFromScratch}
      />
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* QR Code Modal Integration */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        campaignId={selectedCampaignForQR?.id || null}
        campaignName={selectedCampaignForQR?.name || ''}
      />
    </>
  );
}
