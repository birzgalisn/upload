'use client';

import useImageUpload from '@/hooks/useImageUpload';
import Image from 'next/image';

export default function Page() {
  const { file, setFile, isUploading, handleUpload } = useImageUpload({
    onSuccess: () => alert('Upload successful'),
    onError: () => alert('Upload failed'),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleUpload();
  };

  const handleReset = (_e: React.FormEvent<HTMLFormElement>) => {
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFile(files?.item(0) || null);
  };

  const isUploadDisabled = !file || isUploading;

  return (
    <main>
      <h1>Upload a File to S3</h1>
      <form onSubmit={handleSubmit} onReset={handleReset}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/png,image/jpeg"
        />
        {!!file && (
          <div>
            <h2>Preview</h2>
            <div className="relative h-56 w-56">
              <div className="absolute right-0 top-0 z-10 m-2">
                <button
                  className="flex h-6 w-6 items-center justify-center bg-white"
                  type="reset"
                >
                  &times;
                </button>
              </div>
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="object-cover"
                loading="lazy"
                fill
              />
            </div>
          </div>
        )}
        <button type="submit" disabled={isUploadDisabled}>
          Upload
        </button>
      </form>
    </main>
  );
}
