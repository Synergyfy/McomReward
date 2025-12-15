'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { WishlistButton } from '@/components/customer/wishlist/WishlistButton';
import { WishlistModal } from '@/components/customer/wishlist/WishlistModal';
import { useGetPublicCampaigns } from '@/services/customer-campaigns/hook';
import { useGetSectors, useGetCategoriesBySector, useGetSubCategoriesByCategory } from '@/services/sectors/hook';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string>('DESC');
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedWishlistItemName, setSelectedWishlistItemName] = useState<string | undefined>();

  const limit = 10;

  // Fetch filters
  const { data: sectors } = useGetSectors();
  const { data: categories } = useGetCategoriesBySector(selectedSector, 1, 100);
  const { data: subCategories } = useGetSubCategoriesByCategory(selectedCategory, 1, 100);

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useGetPublicCampaigns(
    page,
    limit,
    selectedSector === 'all' ? undefined : selectedSector,
    selectedCategory === 'all' ? undefined : selectedCategory,
    selectedSubCategory === 'all' ? undefined : selectedSubCategory,
    debouncedSearch,
    sortOrder
  );

  const handleWishlistClick = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedWishlistItemName(title);
    setIsWishlistModalOpen(true);
  };

  const handleWishlistSave = () => {
    console.log('Wishlist item saved');
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Debounce logic could be added here, currently just using the value on Enter or blur if desired,
    // or we can use a timeout. For simplicity with React state, a useEffect debounce is common,
    // or just passing the value if the backend is fast.
    // Given the requirement, I'll update the search param after a delay.
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSectorChange = (value: string) => {
    setSelectedSector(value === 'all' ? undefined : value);
    setSelectedCategory(undefined);
    setSelectedSubCategory(undefined);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? undefined : value);
    setSelectedSubCategory(undefined);
    setPage(1);
  };

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value === 'all' ? undefined : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setPage(1);
  };

  const totalPages = campaignsData ? Math.ceil(campaignsData.total / limit) : 0;

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto pt-20 md:pt-28 pb-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Explore Campaigns</h1>
            <p className="mt-4 text-lg text-gray-600">Discover offers and rewards from businesses you love.</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-10 space-y-6">
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for campaigns..."
                className="w-full pl-10 pr-4 py-2 h-12 rounded-full bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {/* Sector Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedSector || 'all'} onValueChange={handleSectorChange}>
                  <SelectTrigger className="w-full bg-white rounded-md">
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={selectedCategory || 'all'}
                  onValueChange={handleCategoryChange}
                  disabled={!selectedSector}
                >
                  <SelectTrigger className="w-full bg-white rounded-md">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SubCategory Filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={selectedSubCategory || 'all'}
                  onValueChange={handleSubCategoryChange}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger className="w-full bg-white rounded-md">
                    <SelectValue placeholder="Select SubCategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SubCategories</SelectItem>
                    {subCategories?.data?.map((subCategory) => (
                      <SelectItem key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="w-full sm:w-48">
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full bg-white rounded-md">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Newest First</SelectItem>
                    <SelectItem value="ASC">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Campaign Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">Loading campaigns...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaignsData?.data?.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl flex flex-col">
                    <div className="relative h-48 w-full shrink-0">
                      <Image
                        src={campaign.bannerUrl || '/placeholder-image.jpg'}
                        alt={campaign.name || 'Campaign Image'}
                        layout="fill"
                        objectFit="cover"
                      />
                      <div className="absolute top-2 right-2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        {campaign.category || 'General'}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/30 rounded-full backdrop-blur-sm">
                        <WishlistButton onClick={(e) => handleWishlistClick(e, campaign.name)} />
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1" title={campaign.name}>{campaign.name}</h2>
                      <p className="text-gray-600 mb-4 h-20 overflow-hidden line-clamp-3">{campaign.campaignMessage}</p>
                      <div className="mt-auto">
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full">View Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {campaignsData?.data?.length === 0 && (
                <p className="text-center text-gray-500 mt-12">No campaigns found. Try adjusting your search or filters.</p>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
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
