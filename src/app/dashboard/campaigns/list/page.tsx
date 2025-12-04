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
import { PlusCircle, Pencil, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetMyCreatedCampaigns, useGetMyClaimedCampaigns, useGetClaimableCampaigns } from '@/services/campaigns/hook';
import ClaimCampaignModal from '@/components/dashboard/campaigns/ClaimCampaignModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import { PublicCampaignResponse } from '@/services/campaigns/types';



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
  const limit = 9; // Changed to 9 to match grid layout (3 cols)
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { data: createdCampaignsData, isLoading: isLoadingCreated } = useGetMyCreatedCampaigns(createdPage, limit);
  const { data: claimedCampaignsData, isLoading: isLoadingClaimed } = useGetMyClaimedCampaigns(claimedPage, limit);
  const { data: claimableCampaignsData } = useGetClaimableCampaigns(1, 20);

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

  const renderCampaigns = (campaigns: PublicCampaignResponse[], isLoading: boolean) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map(campaign => (
          <Card
            key={campaign.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
              {(campaign.banner_url || campaign.bannerUrl) && (
                <Image
                  src={campaign.banner_url || campaign.bannerUrl || ''}
                  alt={campaign.name}
                  layout="fill"
                  objectFit="cover"
                />
              )}
              <Badge
                variant={!campaign.disabled ? 'default' : 'secondary'}
                className="absolute top-3 right-3 text-sm px-3 py-1"
              >
                {!campaign.disabled ? 'Active' : 'Expired'}
              </Badge>
            </div>
            <div className="relative px-5">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
                  {(campaign.logo_url || campaign.logoUrl) ? (
                    <Image
                      src={campaign.logo_url || campaign.logoUrl || ''}
                      alt={`${campaign.name} Logo`}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                      <span className="text-xs">Logo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <CardContent className="pt-16 p-5 text-center">
              <h5 className="font-extrabold text-xl text-gray-900 mb-2 truncate">
                {campaign.name}
              </h5>
              <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">
                {campaign.campaign_message}
              </p>

              <div className="space-y-2 text-sm text-gray-800 my-5 border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Reward:
                  </span>
                  <span className="font-semibold text-right">
                    {campaign.rewards && campaign.rewards.length > 0
                      ? campaign.rewards[0].title
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Available:
                  </span>
                  <span className="font-semibold text-right">
                    {campaign.quantity}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  asChild
                  className="flex-grow py-2 text-md font-semibold bg-orange-600 hover:bg-orange-700 transition-colors duration-200"
                >
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>View Campaign</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                >
                  <Link href={`/dashboard/campaigns/edit/${campaign.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyLink(campaign.id)}
                  title="Copy campaign link"
                >
                  {copiedCampaignId === campaign.id ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Campaigns</h1>
              <p className="text-gray-600">Manage and create your loyalty campaigns.</p>
            </div>
            <Button onClick={() => setIsClaimModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Campaign
            </Button>
          </div>

          <div className="mb-8">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>

          <ClaimableCampaignsTicker />

          <Tabs defaultValue="created" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="created">My Created Campaigns</TabsTrigger>
              <TabsTrigger value="claimed">My Claimed Campaigns</TabsTrigger>
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
    </>
  );
}
