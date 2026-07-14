import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { TrainingVideo } from '@/services/training-videos/types';

interface TrainingVideoCardProps {
  video: TrainingVideo;
}

import { getYouTubeThumbnail } from '@/lib/video-utils';

export default function TrainingVideoCard({ video }: TrainingVideoCardProps) {
  // Prioritize explicit coverImage, then try to extract from YouTube URL, finally fallback to placeholder
  const thumbnail = video.coverImage || getYouTubeThumbnail(video.videoUrl) || 'https://placehold.co/800x450?text=Video+Thumbnail';

  return (
    <Card>
      <CardContent className="p-0 relative h-[200px] w-full bg-gray-100 flex items-center justify-center">
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="rounded-t-lg object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle className="h-12 w-12 text-white opacity-80" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <h3 className="font-bold line-clamp-1">{video.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
        <Button asChild className="w-full">
          <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="mr-2 h-4 w-4" />
            Watch Video
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
