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
      const category = campaign.category || 'General';
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      const title = campaign.title || '';
      const description = campaign.description || '';
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
                <Card key={campaign.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                  <div className="relative h-48 w-full">
                    <Image
                      src={campaign.banner_url || '/placeholder-image.jpg'}
                      alt={campaign.title || 'Campaign Image'}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute top-2 right-2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      {campaign.category || 'General'}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/30 rounded-full backdrop-blur-sm">
                      <WishlistButton onClick={(e) => handleWishlistClick(e, campaign.title)} />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-800">{campaign.title}</h2>
                    <p className="text-gray-600 mb-4 h-20 overflow-hidden line-clamp-3">{campaign.description}</p>
                    <Link href={`/campaigns/${campaign.id}`}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full">View Details</Button>
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
