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
      signatureEndpoint="/api/sign-cloudinary-params"
      onSuccess={(result: any) => {
        onUpload(result?.info?.secure_url || '');
      }}
      onError={(error) => {
        alert(`Error uploading image: ${error.message}`);
      }}
    >
      <Button as="span">Upload Image</Button>
    </CldUploadButton>
  );
}