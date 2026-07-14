'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Step4ReviewProps {
  title: string;
  description: string;
  startDate: string | undefined;
  endDate: string | undefined;
  thumbnailUrl: string;
  subImageUrls: string[];
  rewardId: string;
}

export default function Step4Review({ title, description, startDate, endDate, thumbnailUrl, subImageUrls, rewardId }: Step4ReviewProps) {
  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedEndDate = endDate ? new Date(endDate) : undefined;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Campaign Preview</h2>
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
              {thumbnailUrl ? (
                <Image src={thumbnailUrl} alt="Thumbnail preview" layout="fill" objectFit="cover" />
              ) : (
                <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">Thumbnail</div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {subImageUrls.map((url, index) => (
                <div key={index} className="relative h-16 w-full rounded-md overflow-hidden">
                  <Image src={url} alt={`Sub-image ${index + 1}`} layout="fill" objectFit="cover" />
                </div>
              ))}
              {[...Array(4 - subImageUrls.length)].map((_, index) => (
                <div key={index} className="h-16 w-full bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>

          {/* Campaign Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{title || "Your Campaign Title"}</h1>
            <p className="text-gray-600 mb-4">{description || "Your compelling campaign description will appear here."}</p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p><strong>Starts:</strong> {parsedStartDate?.toLocaleDateString() || "N/A"}</p>
                <p><strong>Ends:</strong> {parsedEndDate?.toLocaleDateString() || "N/A"}</p>
                <p><strong>Associated Reward ID:</strong> {rewardId || "N/A"}</p>
            </div>
            <Button disabled className="w-full">View Details</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
