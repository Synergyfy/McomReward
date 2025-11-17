'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Pencil } from 'lucide-react';
import {
  useGetMyCampaigns,
  useGetAddedAdminCampaigns,
  useGetUnaddedAdminCampaigns,
} from '@/services/campaigns/hook';
import { Campaign, PaginatedCampaignResponse } from '@/services/campaigns/types';
import ClaimCampaignModal from '@/components/dashboard/campaigns/ClaimCampaignModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import { CampaignTemplate } from '@/lib/mock-data/template-campaigns';

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const campaignUrl = `${window.location.origin}/campaigns/${campaign.id}`;
    navigator.clipboard.writeText(campaignUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
        {campaign.banner_url && (
          <Image
            src={campaign.banner_url}
            alt={campaign.name}
            layout="fill"
            objectFit="cover"
          />
        )}
        <Badge
          variant="default"
          className="absolute top-3 right-3 text-sm px-3 py-1"
        >
          Active
        </Badge>
      </div>
      <div className="relative px-5">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
            {campaign.logo_url ? (
              <Image
                src={campaign.logo_url}
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
            onClick={handleCopy}
            title="Copy campaign link"
          >
            {copied ? (
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
  );
};

const PaginationControls = ({
  data,
  page,
  setPage,
}: {
  data: PaginatedCampaignResponse | undefined;
  page: number;
  setPage: (page: number) => void;
}) => {
  if (!data || data.total === 0) return null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <Button
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="text-gray-600">
        Page {data.page} of {Math.ceil(data.total / data.limit)}
      </span>
      <Button
        onClick={() => setPage(page + 1)}
        disabled={page >= Math.ceil(data.total / data.limit)}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};

const CampaignSection = ({
  title,
  description,
  data,
  isLoading,
  page,
  setPage,
}: {
  title: string;
  description?: string;
  data: PaginatedCampaignResponse | undefined;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
}) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-500 mb-6">{description}</p>}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading campaigns...</p>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.data.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          <PaginationControls data={data} page={page} setPage={setPage} />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No campaigns found in this section.</p>
        </div>
      )}
    </div>
  );
};

// Mock user data to simulate tier
const currentUser = {
  plan: 'starter', // 'starter', 'co-branded', 'white-label'
};

export default function CampaignsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [myCampaignsPage, setMyCampaignsPage] = useState(1);
  const [addedCampaignsPage, setAddedCampaignsPage] = useState(1);
  const [unaddedCampaignsPage, setUnaddedCampaignsPage] = useState(1);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { data: myCampaignsData, isLoading: isLoadingMyCampaigns } =
    useGetMyCampaigns(myCampaignsPage);
  const { data: addedCampaignsData, isLoading: isLoadingAddedCampaigns } =
    useGetAddedAdminCampaigns(addedCampaignsPage);
  const { data: unaddedCampaignsData, isLoading: isLoadingUnaddedCampaigns } =
    useGetUnaddedAdminCampaigns(unaddedCampaignsPage);

  const handleCreateFromScratch = useCallback(() => {
    setIsClaimModalOpen(false);
    if (currentUser.plan === 'white-label') {
      // TODO: Handle campaign creation
    } else {
      setIsUpgradeModalOpen(true);
    }
  }, []);

  const handleSelectTemplate = useCallback((template: CampaignTemplate) => {
    setIsClaimModalOpen(false);
    // TODO: Handle campaign creation from template
  }, []);

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

          <CampaignSection
            title="Campaigns Ready to Claim!"
            description="These are campaigns created by the admin that you can add to your list."
            data={unaddedCampaignsData}
            isLoading={isLoadingUnaddedCampaigns}
            page={unaddedCampaignsPage}
            setPage={setUnaddedCampaignsPage}
          />

          <CampaignSection
            title="Campaigns Added from Admin"
            description="These are campaigns created by the admin that you have added."
            data={addedCampaignsData}
            isLoading={isLoadingAddedCampaigns}
            page={addedCampaignsPage}
            setPage={setAddedCampaignsPage}
          />

          <CampaignSection
            title="My Created Campaigns"
            data={myCampaignsData}
            isLoading={isLoadingMyCampaigns}
            page={myCampaignsPage}
            setPage={setMyCampaignsPage}
          />
        </div>
      </div>
      <ClaimCampaignModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onCreateFromScratch={handleCreateFromScratch}
      />
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </>
  );
}
