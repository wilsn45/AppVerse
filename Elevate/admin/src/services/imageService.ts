import imageCompression from 'browser-image-compression';

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import {storage} from '../firebase/firebase';

export interface UploadedFeedImage {
  url: string;
  storagePath: string;
  width: number;
  height: number;
  bytes: number;
}

const MAX_SOURCE_BYTES =
  20 * 1024 * 1024;

const MAX_OUTPUT_BYTES =
  500 * 1024;

const getImageDimensions = async (
  file: Blob,
): Promise<{
  width: number;
  height: number;
}> => {
  const bitmap =
    await createImageBitmap(file);

  const dimensions = {
    width: bitmap.width,
    height: bitmap.height,
  };

  bitmap.close();

  return dimensions;
};

export const optimizeFeedImage = async (
  file: File,
): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    throw new Error(
      'Please choose a valid image file.',
    );
  }

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(
      'Image is too large. Maximum source size is 20 MB.',
    );
  }

  const compressed =
    await imageCompression(
      file,
      {
        maxSizeMB: 0.42,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.82,
        alwaysKeepResolution: false,
      },
    );

  if (compressed.size > MAX_OUTPUT_BYTES) {
    throw new Error(
      'Unable to compress this image below 500 KB. Please choose a smaller image.',
    );
  }

  return new File(
    [compressed],
    'feed.webp',
    {
      type: 'image/webp',
    },
  );
};

export const uploadCurioFeedImage = async (
  curioId: string,
  originalFile: File,
): Promise<UploadedFeedImage> => {
  const file =
    await optimizeFeedImage(
      originalFile,
    );

  const dimensions =
    await getImageDimensions(file);

  const storagePath =
    `curio/feed/${curioId}/feed.webp`;

  const imageRef =
    ref(storage, storagePath);

  await uploadBytes(
    imageRef,
    file,
    {
      contentType: 'image/webp',

      cacheControl:
        'public,max-age=31536000',
    },
  );

  const url =
    await getDownloadURL(imageRef);

  return {
    url,
    storagePath,

    width:
      dimensions.width,

    height:
      dimensions.height,

    bytes:
      file.size,
  };
};

export const deleteCurioFeedImage = async (
  storagePath?: string,
): Promise<void> => {
  if (!storagePath) {
    return;
  }

  try {
    await deleteObject(
      ref(storage, storagePath),
    );
  } catch (error) {
    console.warn(
      'Unable to delete previous Curio image.',
      error,
    );
  }
};
