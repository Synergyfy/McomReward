'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MatchingPointReward } from '@/services/matching-points/types';
import { Lock, Unlock, Image as ImageIcon, Calendar } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';
import { format } from 'date-fns';

interface MatchingRewardCardProps {
  reward: MatchingPointReward;
  currentBalance: number;
  onClick: () => void;
  // If true, shows dates and hides audience (Regular Business View)
  showDates?: boolean;
}

export default function MatchingRewardCard({ reward, currentBalance, onClick, showDates = false }: MatchingRewardCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Map fields (Handle camelCase from API response and legacy snake_case)
  const pointsRequired = reward.requiredPoints ?? reward.required_points ?? reward.pointsRequired ?? 0;
  const image = reward.mainImage ?? reward.main_image ?? reward.image ?? '';
  const description = reward.shortDescription ?? reward.short_description ?? reward.longDescription ?? reward.long_description ?? '';
  const gallery = reward.galleryImages ?? reward.gallery_images ?? [];
  const startDate = reward.startDatetime || reward.start_datetime;
  const endDate = reward.endDatetime || reward.end_datetime;

  const progress = pointsRequired > 0 ? Math.min((currentBalance / pointsRequired) * 100, 100) : 100;
  const isRedeemable = currentBalance >= pointsRequired;

  const handleImageClick = (e: React.MouseEvent, imgUrl: string) => {
      e.stopPropagation(); // Prevent card click
      setPreviewImage(imgUrl);
  };

  return (
    <>
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg flex flex-col h-full ${isRedeemable ? 'border-green-200' : 'opacity-90'}`}
      onClick={onClick}
    >
      <div className="h-40 bg-gray-100 relative shrink-0">
        {image ? (
          <img
            src={image}
            alt={reward.title}
            className="w-full h-full object-cover"
            onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
            }}
            onClick={(e) => handleImageClick(e, image)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        <div className="absolute top-2 right-2">
            {isRedeemable ? (
                <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <Unlock className="h-3 w-3" /> Redeemable
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-gray-200/90 gap-1 text-gray-700">
                    <Lock className="h-3 w-3" /> {pointsRequired - currentBalance} pts needed
                </Badge>
            )}
        </div>
        {gallery.length > 0 && (
           <div className="absolute bottom-2 right-2">
               <Badge variant="secondary" className="bg-black/50 text-white border-none gap-1 px-1.5 h-5 text-[10px]">
                   <ImageIcon className="h-3 w-3" /> +{gallery.length}
               </Badge>
           </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3 flex flex-col flex-grow">
        <div className="space-y-1 flex-grow">
            <h3 className="font-bold text-lg leading-tight">{reward.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        </div>

        {/* Gallery Thumbnails - Clickable */}
        {gallery.length > 0 && (
           <div className="flex gap-2 overflow-hidden py-1 h-12">
               {gallery.slice(0, 4).map((img, idx) => (
                   <div
                      key={idx}
                      className="h-full aspect-square rounded overflow-hidden border border-gray-100 cursor-zoom-in hover:opacity-80 transition-opacity"
                      onClick={(e) => handleImageClick(e, img)}
                    >
                       <img src={img} alt="gallery" className="h-full w-full object-cover" />
                   </div>
               ))}
           </div>
        )}

        <div className="space-y-2 pt-2 mt-auto">
            {/* Conditional Dates Display for Regular Business */}
            {showDates && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 border-b pb-2 mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <div className="flex flex-col">
                        <span>Start: {startDate ? format(new Date(startDate), 'MMM d, yyyy') : 'N/A'}</span>
                        <span>End: {endDate ? format(new Date(endDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                </div>
            )}

            <div className="flex justify-between text-xs font-medium">
                <span className={isRedeemable ? 'text-green-600' : 'text-gray-500'}>
                    {isRedeemable ? 'Goal Reached!' : 'Progress'}
                </span>
                <span>{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className={`h-2 ${isRedeemable ? 'bg-green-100' : 'bg-gray-100'}`} indicatorClassName={isRedeemable ? 'bg-green-500' : 'bg-indigo-500'} />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{currentBalance} pts</span>
                <span>{pointsRequired} pts</span>
            </div>
        </div>
      </CardContent>
      {/* Footer for Quantity - only if dates are shown (mimic super business style) */}
      {showDates && (
        <CardFooter className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
             <span>Qty: {reward.quantity}</span>
        </CardFooter>
      )}
    </Card>

    <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
    />
    </>
  );
}
