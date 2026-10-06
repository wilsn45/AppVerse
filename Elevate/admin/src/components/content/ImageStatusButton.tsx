import {
  Image as ImageIcon,
  ImageOff,
  Link2,
} from 'lucide-react';

import type {
  AdminContentItem,
} from '../../services/contentService';

interface Props {
  item: AdminContentItem;
  onClick: () => void;
}

type ImageStatus =
  | 'uploaded'
  | 'external'
  | 'missing';

const getImageStatus = (
  item: AdminContentItem,
): ImageStatus => {
  if (
    item.visual.imageSource === 'uploaded' ||
    Boolean(item.visual.storagePath)
  ) {
    return 'uploaded';
  }

  if (
    item.visual.imageSource === 'external' ||
    Boolean(item.visual.url?.trim())
  ) {
    return 'external';
  }

  return 'missing';
};

export const ImageStatusButton = ({
  item,
  onClick,
}: Props) => {
  const status =
    getImageStatus(item);

  if (status === 'uploaded') {
    return (
      <button
        className="image-status uploaded"
        onClick={onClick}
        title="Preview or replace uploaded image">

        <ImageIcon size={16} />

        Uploaded
      </button>
    );
  }

  if (status === 'external') {
    return (
      <button
        className="image-status external"
        onClick={onClick}
        title="Preview or replace external image">

        <Link2 size={16} />

        External
      </button>
    );
  }

  return (
    <button
      className="image-status missing"
      onClick={onClick}
      title="Add an image">

      <ImageOff size={16} />

      Missing
    </button>
  );
};
