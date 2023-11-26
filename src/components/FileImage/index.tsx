import { memo } from 'react';
import Image, { type ImageProps } from 'next/image';

type FileImage = Omit<ImageProps, 'src' | 'alt'> & {
  file: File;
};

export default memo(function FileImage({ file, ...props }: FileImage) {
  if (!file) {
    return null;
  }

  return <Image src={URL.createObjectURL(file)} alt={file.name} {...props} />;
});
