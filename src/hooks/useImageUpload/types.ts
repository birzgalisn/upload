export type OnSuccess = () => void;

export enum ImageUploadError {
  Presign = 'presign',
  Upload = 'upload',
  Network = 'network',
}

export type OnError = (error: ImageUploadError) => void;
