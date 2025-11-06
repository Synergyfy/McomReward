import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { TrainingVideo } from '@/lib/mock-data/support';

interface TrainingVideoCardProps {
  video: TrainingVideo;
}

export default function TrainingVideoCard({ video }: TrainingVideoCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={800}
          height={450}
          className="rounded-t-lg object-cover"
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <h3 className="font-bold">{video.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{video.description}</p>
        <Button asChild>
          <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="mr-2 h-4 w-4" />
            Watch Video
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
