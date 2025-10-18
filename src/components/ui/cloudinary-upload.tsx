'use client';

import { CldUploadButton } from 'next-cloudinary';
import { Button } from '@/components/ui/button';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
}

export function CloudinaryUpload({ onUpload }: CloudinaryUploadProps) {
  return (
    <CldUploadButton
      options={{ maxFiles: 1 }}
      onSuccess={(result: any) => {
        onUpload(result?.info?.secure_url || '');
      }}
      uploadPreset="next-cloudinary-unsigned"
    >
      <Button as="span">Upload Image</Button>
    </CldUploadButton>
  );
}
