import { useMutation } from '@tanstack/react-query';

interface UploadResponse {
  secure_url: string;
}

interface UploadParams {
  file: File;
  folder: string;
}

const uploadImage = async ({ file, folder }: UploadParams): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/${folder}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Image upload failed');
  }

  return response.json();
};

export const useUploadToCloudinary = () => {
  return useMutation({
    mutationFn: uploadImage,
  });
};
