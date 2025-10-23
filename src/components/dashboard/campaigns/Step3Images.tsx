'use client';

import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import Image from "next/image";

interface Step3ImagesProps {
  thumbnailUrl: string;
  subImageUrls: string[];
  setThumbnailUrl: (url: string) => void;
  setSubImageUrls: (urls: string[]) => void;
}

export default function Step3Images({ thumbnailUrl, subImageUrls, setThumbnailUrl, setSubImageUrls }: Step3ImagesProps) {

  const handleSubImageUpload = (url: string, index: number) => {
    const newUrls = [...subImageUrls];
    newUrls[index] = url;
    setSubImageUrls(newUrls);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Campaign Images</h2>
      <div className="space-y-8">
        {/* Thumbnail Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
          <p className="text-xs text-muted-foreground mb-2">This is the main image for your campaign.</p>
          <CloudinaryUpload onUpload={setThumbnailUrl} />
          {thumbnailUrl && (
            <div className="mt-4 p-2 border rounded-lg">
              <p className="text-sm font-medium mb-2">Thumbnail Preview:</p>
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={thumbnailUrl} alt="Thumbnail preview" layout="fill" objectFit="cover" />
              </div>
            </div>
          )}
        </div>

        {/* Sub-images Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Additional Images</label>
          <p className="text-xs text-muted-foreground mb-2">Add up to 4 more images to showcase your campaign.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 border p-2 rounded-lg">
                <p className="text-xs font-semibold">Image {index + 1}</p>
                <CloudinaryUpload onUpload={(url) => handleSubImageUpload(url, index)} />
                {subImageUrls[index] && (
                  <div className="mt-2 relative w-24 h-24 rounded-md overflow-hidden">
                    <Image src={subImageUrls[index]} alt={`Sub-image ${index + 1}`} layout="fill" objectFit="cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
