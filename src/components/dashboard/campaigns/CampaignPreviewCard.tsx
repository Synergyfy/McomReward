'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { format } from 'date-fns';
import { Gift, Calendar } from 'lucide-react';

interface CampaignPreviewCardProps {
  title: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  rewardTitle: string;
  rewardImage: string;
  rewardPoints: number;
  rewardValue: number;
}

export default function CampaignPreviewCard({
  title,
  description,
  startDate,
  endDate,
  rewardTitle,
  rewardImage,
  rewardPoints,
  rewardValue,
}: CampaignPreviewCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg rounded-2xl border-2 border-gray-200">
      <CardHeader className="p-0 relative h-48 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
        <Image
          src={rewardImage}
          alt={rewardTitle}
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white z-10">
          <h3 className="text-2xl font-bold text-center">{title}</h3>
          <p className="text-sm text-center mt-2">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{startDate ? format(startDate, 'MMM dd, yyyy') : 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{endDate ? format(endDate, 'MMM dd, yyyy') : 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={rewardImage}
              alt={rewardTitle}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{rewardTitle}</h4>
            <p className="text-sm text-muted-foreground">{rewardPoints} Points | ${rewardValue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
