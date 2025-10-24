'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Step4ReviewProps {
  title: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  thumbnailUrl: string;
  subImageUrls: string[];
  rewardId: string;
}

export default function Step4Review({ title, description, startDate, endDate, rewardId }: Step4ReviewProps) {
  const [previewThumbnail, setPreviewThumbnail] = useState('');
  const [previewSubImages, setPreviewSubImages] = useState<string[]>([]);

  useEffect(() => {
    // Retrieve images from sessionStorage on component mount
    const thumb = sessionStorage.getItem('thumbnailUrl');
    const subs = sessionStorage.getItem('subImageUrls');
    if (thumb) setPreviewThumbnail(thumb);
    if (subs) setPreviewSubImages(JSON.parse(subs));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Campaign Preview</h2>
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
              {previewThumbnail ? (
                <Image src={previewThumbnail} alt="Thumbnail preview" layout="fill" objectFit="cover" />
              ) : (
                <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">Thumbnail</div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {previewSubImages.map((url, index) => (
                <div key={index} className="relative h-16 w-full rounded-md overflow-hidden">
                  <Image src={url} alt={`Sub-image ${index + 1}`} layout="fill" objectFit="cover" />
                </div>
              ))}
              {[...Array(4 - previewSubImages.length)].map((_, index) => (
                <div key={index} className="h-16 w-full bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>

          {/* Campaign Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{title || "Your Campaign Title"}</h1>
            <p className="text-gray-600 mb-4">{description || "Your compelling campaign description will appear here."}</p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p><strong>Starts:</strong> {startDate?.toLocaleDateString() || "N/A"}</p>
                <p><strong>Ends:</strong> {endDate?.toLocaleDateString() || "N/A"}</p>
                <p><strong>Associated Reward ID:</strong> {rewardId || "N/A"}</p>
            </div>
            <Button disabled className="w-full">View Details</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
