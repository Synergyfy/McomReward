'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { WishlistButton } from '@/components/customer/wishlist/WishlistButton';
import { WishlistModal } from '@/components/customer/wishlist/WishlistModal';
import { useGetPublicCampaigns } from '@/services/customer-campaigns/hook';

const categories = ['All', 'Retail', 'Restaurants', 'Technology', 'Services', 'Travel'];

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedWishlistItemName, setSelectedWishlistItemName] = useState<string | undefined>();

  const { data: campaignsData, isLoading } = useGetPublicCampaigns(1, 100);

  const handleWishlistClick = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedWishlistItemName(title);
    setIsWishlistModalOpen(true);
  };

  const filteredCampaigns = useMemo(() => {
    if (!campaignsData?.data) return [];

    return campaignsData.data.filter(campaign => {
      // Category is not in the new response, so we default to 'General' or check if we should filter by it at all.
      // For now, we'll assume all campaigns are 'General' if no category field exists, or maybe we can't filter by category effectively without it.
      // Let's assume 'General' for now to keep the UI working.
      const category = 'General';
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      const title = campaign.name || '';
      const description = campaign.campaignMessage || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, campaignsData]);

  const handleWishlistSave = () => {
    console.log('Wishlist item saved');
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto pt-48 pb-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Explore Campaigns</h1>
            <p className="mt-4 text-lg text-gray-600">Discover offers and rewards from businesses you love.</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-10">
            <div className="relative max-w-lg mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for campaigns..."
                className="w-full pl-10 pr-4 py-2 h-12 rounded-full bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex justify-center flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Campaign Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">Loading campaigns...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl border border-gray-100 bg-white flex flex-col h-full"
                >
                  {/* Banner Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={campaign.bannerUrl || '/placeholder-image.jpg'}
                      alt={campaign.name || 'Campaign Banner'}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay Gradient for Text Contrast (Optional) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                    {/* Wishlist Button */}
                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-1 hover:bg-white/40 transition-colors">
                        <WishlistButton onClick={(e) => handleWishlistClick(e, campaign.name)} />
                      </div>
                    </div>

                    {/* Sector Tag */}
                    {campaign.business?.sectorName && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                        {campaign.business.sectorName}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    {/* Business Info Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative h-10 w-10 shrink-0">
                        {campaign.business?.profileImage ? (
                          <Image
                            src={campaign.business.profileImage}
                            alt={campaign.business.name || 'Business Logo'}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full border border-gray-100 shadow-sm"
                          />
                        ) : (
                          <div className="h-full w-full rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
                            <span className="text-orange-600 font-bold text-sm">
                              {campaign.business?.name?.charAt(0).toUpperCase() || 'B'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {campaign.business?.name || 'Unknown Business'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          Verified Business
                        </span>
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {campaign.name}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                      {campaign.campaignMessage || 'Check out this amazing campaign and earn rewards!'}
                    </p>

                    {/* CTA Button */}
                    <Link href={`/campaigns/${campaign.id}`} className="mt-auto">
                      <Button className="w-full bg-gray-900 hover:bg-orange-600 text-white rounded-xl py-6 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredCampaigns.length === 0 && (
            <p className="text-center text-gray-500 mt-12">No campaigns found. Try adjusting your search or filters.</p>
          )}
        </div>
      </div>
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        itemName={selectedWishlistItemName}
        onSave={handleWishlistSave}
      />
    </>
  );
}
