'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorId, setSectorId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string>('DESC');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Custom debounce implementation if hook not found, but trying to use one if available.
  // I'll implement a simple debounce here to be safe and autonomous.
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedWishlistItemName, setSelectedWishlistItemName] = useState<string | undefined>();

  // Fetch Filters Data
  const { data: sectors } = useGetSectors();
  const { data: categories } = useGetCategoriesBySector(sectorId, 1, 100);
  const { data: subCategories } = useGetSubCategoriesByCategory(categoryId, 1, 100);

  // Fetch Campaigns
  const { data: campaignsData, isLoading } = useGetPublicCampaigns(
    page,
    limit,
    sectorId,
    categoryId,
    subCategoryId,
    debouncedSearch,
    sort
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

  // Filter Handlers
  const handleSectorChange = (value: string) => {
    setSectorId(value === 'all' ? undefined : value);
    setCategoryId(undefined);
    setSubCategoryId(undefined);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value === 'all' ? undefined : value);
    setSubCategoryId(undefined);
    setPage(1);
  };

  const handleSubCategoryChange = (value: string) => {
    setSubCategoryId(value === 'all' ? undefined : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const totalPages = campaignsData ? Math.ceil(campaignsData.total / limit) : 0;

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto pt-5 pb-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Explore Campaigns</h1>
            <p className="mt-4 text-lg text-gray-600">Discover offers and rewards from businesses you love.</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-10 max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative w-full mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for campaigns..."
                className="w-full pl-10 pr-4 py-2 h-12 rounded-full bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setDebouncedSearch(searchTerm);
                        setPage(1);
                    }
                }}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Sector Filter */}
               <Select onValueChange={handleSectorChange} value={sectorId || 'all'}>
                <SelectTrigger className="w-full bg-white h-12 rounded-xl">
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

              {/* Category Filter */}
              <Select
                onValueChange={handleCategoryChange}
                value={categoryId || 'all'}
                disabled={!sectorId}
              >
                <SelectTrigger className="w-full bg-white h-12 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.data.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* SubCategory Filter */}
              <Select
                onValueChange={handleSubCategoryChange}
                value={subCategoryId || 'all'}
                disabled={!categoryId}
              >
                <SelectTrigger className="w-full bg-white h-12 rounded-xl">
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {subCategories?.data.map((subCategory) => (
                    <SelectItem key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select onValueChange={handleSortChange} value={sort}>
                <SelectTrigger className="w-full bg-white h-12 rounded-xl">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESC">Newest First</SelectItem>
                  <SelectItem value="ASC">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaign Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">Loading campaigns...</p>
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {campaignsData?.data.map((campaign) => (
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="rounded-full px-4"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <span className="text-gray-600 font-medium">
                            Page {page} of {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="rounded-full px-4"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </>
          )}

          {!isLoading && campaignsData?.data.length === 0 && (
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
