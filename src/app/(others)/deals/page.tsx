"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetDeals } from '@/services/deals/hook';
import { useGetCategories } from '@/services/sectors/hook';
import { Deal } from '@/services/deals/types';
import {
  Loader2,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Tag,
  Flame,
  Star,
  Heart,
  ShoppingBag,
  MapPin,
  X,
  ChevronLeft,
  Grid3X3,
  LayoutList,
  Percent,
  Zap,
  TrendingUp,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format, differenceInHours, differenceInDays } from 'date-fns';

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'Food & Dining': '🍔',
  'Fashion': '👗',
  'Electronics': '📱',
  'Beauty': '💄',
  'Health': '💪',
  'Travel': '✈️',
  'Entertainment': '🎬',
  'Sports': '⚽',
  'Home': '🏠',
  'Services': '🔧',
};

// Flash Deal Timer Component
function FlashDealTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <div className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</div>
      <span className="text-gray-400">:</span>
      <div className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</div>
      <span className="text-gray-400">:</span>
      <div className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</div>
    </div>
  );
}

// Enhanced Deal Card Component
function MarketplaceDealCard({ deal }: { deal: Deal }) {
  const discountPercent = deal.originalPrice
    ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
    : 0;

  const hoursLeft = differenceInHours(new Date(deal.endDate), new Date());
  const isFlashDeal = hoursLeft <= 24 && hoursLeft > 0;

  return (
    <Link href={`/deals/${deal.id}`} className="block group">
      <Card className="h-full overflow-hidden border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 bg-white">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag size={48} />
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discountPercent}%
            </div>
          )}

          {/* Featured Badge */}
          {deal.isFeatured && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Flame size={10} /> Hot
            </div>
          )}

          {/* Flash Deal Badge */}
          {isFlashDeal && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 backdrop-blur text-white text-xs py-1.5 px-2 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1"><Zap size={12} /> Flash Deal</span>
              <FlashDealTimer endDate={deal.endDate} />
            </div>
          )}

          {/* Wishlist Button */}
          <button
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Heart size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Type */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-orange-100 text-orange-700 font-medium">
              {deal.category?.name || deal.type || 'Deal'}
            </Badge>
            {deal.business?.name && (
              <span className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                <Store size={10} />
                {deal.business.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
            {deal.title}
          </h3>

          {/* Rating placeholder - mock */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={i < 4 ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-xs text-gray-400">(128)</span>
          </div>

          {/* Price Section */}
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-600">£{Number(deal.dealPrice).toFixed(2)}</span>
              {deal.originalPrice && Number(deal.originalPrice) > Number(deal.dealPrice) && (
                <span className="text-sm text-gray-400 line-through">£{Number(deal.originalPrice).toFixed(2)}</span>
              )}
            </div>
            {deal.soldQuantity > 0 && (
              <span className="text-[11px] text-gray-400 block mt-1">{deal.soldQuantity} people claimed this</span>
            )}
          </div>

          {/* Location */}
          {deal.location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin size={12} />
              <span className="truncate">{deal.location}</span>
            </div>
          )}

          {/* View Button */}
          <Button
            variant="outline"
            className="w-full mt-4 border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
          >
            View Deal
          </Button>
        </div>
      </Card>
    </Link>
  );
}

export default function DealsMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: categoriesData } = useGetCategories();
  const { data: dealsData, isLoading, isError } = useGetDeals({
    page,
    limit,
    search: searchTerm || undefined,
    status: 'approved',
    categoryId: selectedCategory || undefined,
  });

  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  const deals = useMemo(() => {
    if (!dealsData?.data) return [];
    let filtered = [...dealsData.data];

    // Filter by price range
    filtered = filtered.filter(d => d.dealPrice >= priceRange[0] && d.dealPrice <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.dealPrice - b.dealPrice);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.dealPrice - a.dealPrice);
        break;
      case 'popular':
        filtered.sort((a, b) => b.soldQuantity - a.soldQuantity);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [dealsData, priceRange, sortBy]);

  const flashDeals = useMemo(() => {
    if (!dealsData?.data) return [];
    return dealsData.data
      .filter(d => differenceInHours(new Date(d.endDate), new Date()) <= 24 && differenceInHours(new Date(d.endDate), new Date()) > 0)
      .slice(0, 6);
  }, [dealsData]);

  const totalPages = dealsData ? Math.ceil(dealsData.total / limit) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Discover Exclusive Deals
            </h1>
            <p className="text-lg md:text-xl text-orange-100 mb-8">
              Save big on thousands of products from local businesses near you
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search for deals, products, or businesses..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full h-14 pl-12 pr-4 text-lg rounded-2xl border-0 bg-white text-gray-900 shadow-xl placeholder:text-gray-400"
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl bg-orange-500 hover:bg-orange-600"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap flex-shrink-0",
                selectedCategory === null && "bg-orange-500 hover:bg-orange-600"
              )}
              onClick={() => { setSelectedCategory(null); setPage(1); }}
            >
              All Deals
            </Button>
            {categories.slice(0, 10).map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "rounded-full whitespace-nowrap flex-shrink-0",
                  selectedCategory === cat.id && "bg-orange-500 hover:bg-orange-600"
                )}
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              >
                <span className="mr-1">{categoryIcons[cat.name] || '🏷️'}</span>
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 py-6 mb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur p-2 rounded-lg">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Flash Deals</h2>
                  <p className="text-sm text-orange-100">Ending soon! Don't miss out</p>
                </div>
              </div>
              <Link href="/deals?flash=true">
                <Button variant="secondary" size="sm" className="rounded-full">
                  View All <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {flashDeals.map((deal) => (
                <MarketplaceDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Categories</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={selectedCategory === cat.id}
                        onCheckedChange={() => {
                          setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                          setPage(1);
                        }}
                      />
                      <span className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={1000}
                  step={10}
                  className="mt-2"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>£{priceRange[0]}</span>
                  <span>£{priceRange[1]}</span>
                </div>
              </div>

              {/* Deal Type */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Deal Type</h4>
                <div className="space-y-2">
                  {['DISCOUNT', 'BUNDLE', 'BOGO', 'FLASH_SALE'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox />
                      <span className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors capitalize">
                        {type.replace('_', ' ').toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange([0, 1000]);
                  setPage(1);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          {/* Deals Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal size={16} className="mr-2" /> Filters
                </Button>
                <span className="text-sm text-gray-500">
                  <strong className="text-gray-900">{dealsData?.total || 0}</strong> deals found
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View Toggle */}
                <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className={cn("p-2", viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500')}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    className={cn("p-2", viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500')}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-500">Loading amazing deals...</p>
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-red-500 mb-4">Oops! Something went wrong while fetching deals.</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            )}

            {/* Deals Grid */}
            {!isLoading && !isError && deals.length > 0 && (
              <>
                <div className={cn(
                  "grid gap-4",
                  viewMode === 'grid'
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}>
                  {deals.map((deal) => (
                    <MarketplaceDealCard key={deal.id} deal={deal} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                            page === pageNum
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              </>
            )}

            {/* Empty State */}
            {!isLoading && !isError && deals.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="text-gray-300" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setPriceRange([0, 1000]);
                }}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-600 mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      selectedCategory === cat.id
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-200"
                    )}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-600 mb-3">Price Range</h4>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={1000}
                step={10}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>£{priceRange[0]}</span>
                <span>£{priceRange[1]}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange([0, 1000]);
                }}
              >
                Clear
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
