'use client';

import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';

import { Button } from '@/components/ui/button';

import { Upload } from 'lucide-react';



interface CloudinaryUploadProps {

  onUpload: (url: string) => void;

}



export function CloudinaryUpload({ onUpload }: CloudinaryUploadProps) {

  return (

    <CldUploadButton

      options={{ maxFiles: 1 }}

      signatureEndpoint="/api/sign-cloudinary-params"

      onSuccess={(result: CloudinaryUploadWidgetResults) => {

        if (typeof result.info !== 'string' && result.info?.secure_url) {

          onUpload(result.info.secure_url);

        }

      }}

      onError={(error) => {

        console.error('Cloudinary upload error:', error);

        alert('An error occurred during the upload. Please try again.');

      }}

    >

      <div className="flex items-center">

        <Upload className="mr-2 h-4 w-4" />

        <span>Upload Image</span>

      </div>

    </CldUploadButton>

  );

}
