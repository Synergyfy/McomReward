'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useGetDeal, useGetDeals } from '@/services/deals/hook';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Store,
  Share2,
  Heart,
  Shield,
  CheckCircle2,
  Star,
  Users,
  Zap,
  Gift,
  Percent,
  ChevronRight,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Deal } from '@/services/deals/types';

// Image Gallery Component
function ImageGallery({ images, mainImage, title }: { images: string[], mainImage: string | null, title: string }) {
  const [selectedImage, setSelectedImage] = useState(mainImage || images[0] || null);
  const allImages = mainImage ? [mainImage, ...images.filter(img => img !== mainImage)] : images;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Gift size={80} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={cn(
                "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                selectedImage === img ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Image src={img} alt={`${title} ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Countdown Timer Component
function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <div className="bg-gray-900 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold">
          {timeLeft.days}
        </div>
        <span className="text-xs text-gray-500 mt-1">Days</span>
      </div>
      <span className="text-2xl font-bold text-gray-300">:</span>
      <div className="text-center">
        <div className="bg-gray-900 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <span className="text-xs text-gray-500 mt-1">Hours</span>
      </div>
      <span className="text-2xl font-bold text-gray-300">:</span>
      <div className="text-center">
        <div className="bg-gray-900 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <span className="text-xs text-gray-500 mt-1">Mins</span>
      </div>
      <span className="text-2xl font-bold text-gray-300">:</span>
      <div className="text-center">
        <div className="bg-orange-500 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <span className="text-xs text-gray-500 mt-1">Secs</span>
      </div>
    </div>
  );
}

// Related Deal Card
function RelatedDealCard({ deal }: { deal: Deal }) {
  const discountPercent = deal.originalPrice
    ? Math.round(((Number(deal.originalPrice) - Number(deal.dealPrice)) / Number(deal.originalPrice)) * 100)
    : 0;

  return (
    <Link href={`/deals/${deal.id}`} className="group block">
      <Card className="overflow-hidden border-gray-100 hover:shadow-lg transition-all">
        <div className="relative aspect-square">
          {deal.imageUrl ? (
            <Image src={deal.imageUrl} alt={deal.title} fill className="object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Gift className="text-gray-300" size={32} />
            </div>
          )}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">{deal.title}</h4>
          <p className="font-bold text-orange-600 mt-1">£{Number(deal.dealPrice).toFixed(2)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.dealId as string;
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: deal, isLoading, isError } = useGetDeal(dealId);
  const { data: relatedDeals } = useGetDeals({
    limit: 4,
    status: 'approved',
    categoryId: deal?.category?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading deal details...</p>
      </div>
    );
  }

  if (isError || !deal) {
    notFound();
  }

  const discountPercent = deal.originalPrice
    ? Math.round(((Number(deal.originalPrice) - Number(deal.dealPrice)) / Number(deal.originalPrice)) * 100)
    : 0;

  const daysLeft = differenceInDays(new Date(deal.endDate), new Date());
  const hoursLeft = differenceInHours(new Date(deal.endDate), new Date());
  const isExpiringSoon = hoursLeft <= 48 && hoursLeft > 0;
  const isExpired = new Date(deal.endDate) < new Date();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal.title,
          text: `Check out this amazing deal: ${deal.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const allImages = deal.imageUrl ? [deal.imageUrl, ...(deal.images || [])] : (deal.images || []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/deals" className="text-gray-500 hover:text-orange-600 transition-colors">Deals</Link>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-500">{deal.category?.name || 'All'}</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{deal.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <ImageGallery
              images={deal.images || []}
              mainImage={deal.imageUrl}
              title={deal.title}
            />

            {/* Quick Stats - Mobile */}
            <div className="lg:hidden grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{deal.soldQuantity || 0}</p>
                <p className="text-xs text-gray-500">Claimed</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Star size={18} fill="currentColor" />
                  <span className="text-xl font-bold text-gray-900">4.8</span>
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{daysLeft > 0 ? daysLeft : 0}</p>
                <p className="text-xs text-gray-500">Days Left</p>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                  {deal.category?.name || deal.type || 'Deal'}
                </Badge>
                {discountPercent > 0 && (
                  <Badge className="bg-red-500 text-white">-{discountPercent}% OFF</Badge>
                )}
                {deal.isFeatured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Sparkles size={12} className="mr-1" /> Featured
                  </Badge>
                )}
                {isExpiringSoon && !isExpired && (
                  <Badge className="bg-red-100 text-red-700 animate-pulse">
                    <Zap size={12} className="mr-1" /> Ending Soon!
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {deal.title}
              </h1>

              {/* Business Info */}
              {deal.business && (
                <Link
                  href={`/businesses/${deal.business.id}`}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Store size={16} className="text-orange-600" />
                  </div>
                  <span className="font-medium">{deal.business.name}</span>
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-black text-orange-600">£{Number(deal.dealPrice).toFixed(2)}</span>
                {deal.originalPrice && Number(deal.originalPrice) > Number(deal.dealPrice) && (
                  <>
                    <span className="text-xl text-gray-400 line-through">£{Number(deal.originalPrice).toFixed(2)}</span>
                    <Badge className="bg-green-100 text-green-700">
                      Save £{(Number(deal.originalPrice) - Number(deal.dealPrice)).toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                Deal value: <span className="font-semibold">£{Number(deal.value).toFixed(2)}</span>
              </p>
            </div>

            {/* Countdown Timer */}
            {!isExpired && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-orange-500" size={20} />
                  <span className="font-semibold text-gray-900">Deal Ends In</span>
                </div>
                <CountdownTimer endDate={deal.endDate} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all"
                disabled={isExpired}
              >
                {isExpired ? 'Deal Expired' : 'Claim This Deal'}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleWishlist}
                >
                  <Heart size={18} className={cn("mr-2", isWishlisted && "fill-red-500 text-red-500")} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 size={18} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Valid Period</span>
                </div>
                <p className="font-semibold text-sm">
                  {format(new Date(deal.startDate), 'MMM d')} - {format(new Date(deal.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Tag size={16} />
                  <span className="text-sm">Redemption</span>
                </div>
                <p className="font-semibold text-sm capitalize">{deal.redemptionMethod?.replace('_', ' ').toLowerCase() || 'QR Scan'}</p>
              </div>
              {deal.location && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MapPin size={16} />
                    <span className="text-sm">Location</span>
                  </div>
                  <p className="font-semibold text-sm truncate">{deal.location}</p>
                </div>
              )}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users size={16} />
                  <span className="text-sm">Claimed</span>
                </div>
                <p className="font-semibold text-sm">{deal.soldQuantity || 0} people</p>
              </div>
            </div>

            {/* Points */}
            {(deal.pointsCost || deal.pointsEarned) && (
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center gap-4">
                  {deal.pointsCost && (
                    <div>
                      <p className="text-xs text-purple-600">Points Required</p>
                      <p className="text-xl font-bold text-purple-700">{deal.pointsCost}</p>
                    </div>
                  )}
                  {deal.pointsEarned && (
                    <div>
                      <p className="text-xs text-purple-600">Points Earned</p>
                      <p className="text-xl font-bold text-purple-700">+{deal.pointsEarned}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift size={20} className="text-orange-500" />
                  About This Deal
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {deal.description}
                </p>
                {deal.shortDescription && (
                  <p className="text-gray-500 mt-4 italic">
                    {deal.shortDescription}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-orange-500" />
                  Terms & Conditions
                </h2>
                <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                  {deal.termsAndConditions}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Card */}
          <div className="space-y-6">
            {deal.business && (
              <Card className="border-gray-100 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">About the Business</h3>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xl font-bold">
                      {deal.business.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{deal.business.name}</p>
                      {deal.business.sector && (
                        <p className="text-sm text-gray-500">{deal.business.sector.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {deal.business.address && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{deal.business.address}</span>
                      </div>
                    )}
                    {deal.business.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <a href={`tel:${deal.business.phone}`} className="text-orange-600 hover:underline">
                          {deal.business.phone}
                        </a>
                      </div>
                    )}
                    {deal.business.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        <a href={`mailto:${deal.business.email}`} className="text-orange-600 hover:underline">
                          {deal.business.email}
                        </a>
                      </div>
                    )}
                    {deal.business.website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe size={16} className="text-gray-400" />
                        <a href={deal.business.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline truncate">
                          {deal.business.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full">
                    View All Deals from This Business
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Trust Badges */}
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Verified Business</p>
                      <p className="text-xs text-gray-500">This business has been verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Money-Back Guarantee</p>
                      <p className="text-xs text-gray-500">Full refund if deal not honored</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Deals */}
        {relatedDeals && relatedDeals.data && relatedDeals.data.filter(d => d.id !== deal.id).length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link href="/deals" className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedDeals.data.filter(d => d.id !== deal.id).slice(0, 4).map((relatedDeal) => (
                <RelatedDealCard key={relatedDeal.id} deal={relatedDeal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
