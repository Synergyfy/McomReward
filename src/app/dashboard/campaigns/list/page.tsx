'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ClaimableCampaignsTicker } from '@/components/customer/ClaimableCampaignsTicker';
import { PlusCircle, Pencil } from 'lucide-react';
import ClaimCampaignModal from '@/components/dashboard/campaigns/ClaimCampaignModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import { CampaignTemplate } from '@/lib/mock-data/template-campaigns';

// Mock user data to simulate tier
const currentUser = {
  plan: 'starter', // 'starter', 'co-branded', 'white-label'
};

// Mock data for prototype
const mockCampaigns = [
  {
    id: '1',
    campaignName: 'Summer Sale Spectacular',
    campaignMessage: 'Get ready for our biggest sale of the season! Earn double points on all purchases.',
    reward: { id: '1', title: 'Summer Voucher ($50)' },
    rewardsAvailable: 100,
    ctaButtonText: 'Claim Reward',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'active',
  },
  {
    id: '2',
    campaignName: 'Refer a Friend, Get $100',
    campaignMessage: 'Invite your friends to join and you both get a $100 gift card on us!',
    reward: { id: '2', title: 'Gift Card ($100)' },
    rewardsAvailable: 50,
    ctaButtonText: 'Refer & Earn',
    imageUrl: 'https://images.unsplash.com/photo-1529592691919-7a6aa481f520?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    logoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=2572&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'active',
  },
  {
    id: '3',
    campaignName: 'Holiday Joy Campaign',
    campaignMessage: 'Spread the holiday cheer with 20% off your next purchase.',
    reward: { id: '3', title: 'Discount Coupon (20% off)' },
    rewardsAvailable: 200,
    ctaButtonText: 'Join Now',
    imageUrl: 'https://images.unsplash.com/photo-1577985051167-5d8571a29a2e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    logoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'expired',
  },
];

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [claimedCampaignIdsFromTicker, setClaimedCampaignIdsFromTicker] = useState<string[]>([]);

  useEffect(() => {
    const newlyClaimedCampaign = localStorage.getItem('newlyClaimedCampaign');
    if (newlyClaimedCampaign) {
      const campaign = JSON.parse(newlyClaimedCampaign);
      setCampaigns(prev => [campaign, ...prev]);
      setClaimedCampaignIdsFromTicker(prev => [...prev, campaign.id]); // Add claimed campaign ID to state
      localStorage.removeItem('newlyClaimedCampaign');
    }
  }, []);

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
    if (currentUser.plan === 'white-label') {
      const newCampaign = {
        id: `biz-camp-${new Date().getTime()}`,
        campaignName: 'New Blank Campaign',
        campaignMessage: 'This campaign was created from scratch.',
        reward: { id: 'new-reward', title: 'Custom Reward' },
        rewardsAvailable: 100,
        ctaButtonText: 'Learn More',
        imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop',
        logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop',
        status: 'active' as const,
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    } else {
      setIsUpgradeModalOpen(true);
    }
  }, []);

  const handleSelectTemplate = useCallback((template: CampaignTemplate) => {
    setIsClaimModalOpen(false);
    const newCampaign = {
      id: `biz-camp-${new Date().getTime()}`,
      campaignName: template.title,
      campaignMessage: template.description,
      reward: { id: 'template-reward', title: 'Pre-defined Reward' },
      rewardsAvailable: 150,
      ctaButtonText: 'Claim Offer',
      imageUrl: template.imageUrl,
      logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop',
      status: 'active' as const,
    };
    setCampaigns(prev => [newCampaign, ...prev]);
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.campaignMessage.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, campaigns]);

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

          <ClaimableCampaignsTicker claimedCampaignIds={claimedCampaignIdsFromTicker} />

          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No campaigns found. Create your first campaign!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    {campaign.imageUrl && (
                      <Image src={campaign.imageUrl} alt={campaign.campaignName} layout="fill" objectFit="cover" />
                    )}
                    <Badge
                      variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      className="absolute top-3 right-3 text-sm px-3 py-1"
                    >
                      {campaign.status === 'active' ? 'Active' : 'Expired'}
                    </Badge>
                  </div>
                  <div className="relative px-5">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
                        {campaign.logoUrl ? (
                          <Image
                            src={campaign.logoUrl}
                            alt={`${campaign.campaignName} Logo`}
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
                    <h5 className="font-extrabold text-xl text-gray-900 mb-2 truncate">{campaign.campaignName}</h5>
                    <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">
                      {campaign.campaignMessage}
                    </p>

                    <div className="space-y-2 text-sm text-gray-800 my-5 border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Reward:</span>
                        <span className="font-semibold text-right">{campaign.reward.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Available:</span>
                        <span className="font-semibold text-right">{campaign.rewardsAvailable}</span>
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
          )}
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
