import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface UploadResponse {
  secure_url: string;
  public_id: string;
}

interface UploadParams {
  file: File;
  folder: string;
}

// When true, uploads are sent to the server route (/api/upload/<folder>) which
// stores them on the local filesystem instead of Cloudinary. Intended for local dev.
const LOCAL_FILE_UPLOAD = process.env.NEXT_PUBLIC_LOCAL_FILE_UPLOAD === 'true';

const uploadToServer = async ({ file, folder }: UploadParams): Promise<UploadResponse> => {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/${cleanFolder}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Upload failed');
  }

  return response.json();
};

const uploadImageDirect = async ({ file, folder }: UploadParams): Promise<UploadResponse> => {
  // 1. Get Signature
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
  };

  const { data: { signature } } = await axios.post('/api/sign-cloudinary-params', {
    paramsToSign
  });

  // 2. Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  // Use configured cloud name or fallback to 'demo' to allow mocking/testing if env is missing
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Direct upload failed');
  }

  return response.json();
};

const uploadFile = (params: UploadParams): Promise<UploadResponse> => {
  return LOCAL_FILE_UPLOAD ? uploadToServer(params) : uploadImageDirect(params);
};

export const useUploadToCloudinary = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};
