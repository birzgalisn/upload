import { OnSuccess, OnError, ImageUploadError } from './types';
import { useState } from 'react';

type UseImageUpload = {
  onSuccess?: OnSuccess;
  onError?: OnError;
};

export default function useImageUpload(config: UseImageUpload = {}) {
  const { onSuccess, onError } = config;
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);

      const presignResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        },
      );

      if (!presignResponse.ok) {
        onError?.(ImageUploadError.Presign);
        return;
      }

      const { url, fields } = await presignResponse.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      uploadResponse.ok ? onSuccess?.() : onError?.(ImageUploadError.Upload);
    } catch (error) {
      onError?.(ImageUploadError.Network);
    } finally {
      setIsUploading(false);
    }
  };

  return { file, setFile, isUploading, handleUpload } as const;
}
