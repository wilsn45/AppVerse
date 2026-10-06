import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Image as ImageIcon,
  Link2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import type {
  CuriosityVisual,
} from '@curio/shared';

import type {
  AdminContentItem,
} from '../../services/contentService';

import {
  updateContent,
} from '../../services/contentService';

import {
  deleteCurioFeedImage,
  uploadCurioFeedImage,
} from '../../services/imageService';

interface Props {
  item: AdminContentItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

type ImageMode =
  | 'external'
  | 'upload';

const contentWithoutAdminFields = (
  item: AdminContentItem,
): Record<string, unknown> => {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    ...content
  } = item;

  return content as unknown as Record<
    string,
    unknown
  >;
};

const baseVisualWithoutImageMetadata = (
  visual: CuriosityVisual,
): Omit<
  CuriosityVisual,
  | 'url'
  | 'imageSource'
  | 'storagePath'
  | 'width'
  | 'height'
  | 'bytes'
  | 'source'
> => {
  const {
    url: _url,
    imageSource: _imageSource,
    storagePath: _storagePath,
    width: _width,
    height: _height,
    bytes: _bytes,
    source: _source,
    ...base
  } = visual;

  return base;
};

export const CurioImageModal = ({
  item,
  onClose,
  onSaved,
}: Props) => {
  const currentUrl =
    item.visual.url?.trim() ?? '';

  const [mode, setMode] =
    useState<ImageMode>(
      currentUrl &&
      !item.visual.storagePath
        ? 'external'
        : 'upload',
    );

  const [externalUrl, setExternalUrl] =
    useState(
      currentUrl &&
      !item.visual.storagePath
        ? currentUrl
        : '',
    );

  const [file, setFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const filePreviewUrl =
    useMemo(
      () =>
        file
          ? URL.createObjectURL(file)
          : '',
      [file],
    );

  useEffect(() => {
    document.body.classList.add(
      'modal-open',
    );

    return () => {
      document.body.classList.remove(
        'modal-open',
      );
    };
  }, []);

  useEffect(
    () => () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(
          filePreviewUrl,
        );
      }
    },
    [filePreviewUrl],
  );

  const previewUrl =
    mode === 'upload'
      ? filePreviewUrl || currentUrl
      : externalUrl.trim() || currentUrl;

  const persistVisual = async (
    visual: CuriosityVisual,
  ) => {
    await updateContent(
      item.id,
      {
        ...contentWithoutAdminFields(
          item,
        ),
        visual,
      },
    );

    await onSaved();
    onClose();
  };

  const saveExternal = async () => {
    const url =
      externalUrl.trim();

    if (!url) {
      setError(
        'Enter an image URL.',
      );

      return;
    }

    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      setError(
        'Enter a valid image URL.',
      );

      return;
    }

    if (parsed.protocol !== 'https:') {
      setError(
        'External Curio images must use HTTPS.',
      );

      return;
    }

    try {
      setSaving(true);
      setError('');

      if (item.visual.storagePath) {
        await deleteCurioFeedImage(
          item.visual.storagePath,
        );
      }

      const visual: CuriosityVisual = {
        ...baseVisualWithoutImageMetadata(
          item.visual,
        ),

        url,

        imageSource:
          'external',
      };

      await persistVisual(visual);
    } catch (saveError) {
      console.error(saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save image.',
      );
    } finally {
      setSaving(false);
    }
  };

  const saveUpload = async () => {
    if (!file) {
      setError(
        'Choose an image to upload.',
      );

      return;
    }

    try {
      setSaving(true);
      setError('');

      const uploaded =
        await uploadCurioFeedImage(
          item.id,
          file,
        );

      const visual: CuriosityVisual = {
        ...baseVisualWithoutImageMetadata(
          item.visual,
        ),

        url:
          uploaded.url,

        imageSource:
          'uploaded',

        storagePath:
          uploaded.storagePath,

        width:
          uploaded.width,

        height:
          uploaded.height,

        bytes:
          uploaded.bytes,
      };

      await persistVisual(visual);
    } catch (saveError) {
      console.error(saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to upload image.',
      );
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async () => {
    try {
      setSaving(true);
      setError('');

      if (item.visual.storagePath) {
        await deleteCurioFeedImage(
          item.visual.storagePath,
        );
      }

      const visual: CuriosityVisual = {
        ...baseVisualWithoutImageMetadata(
          item.visual,
        ),

        url: '',

        imageSource:
          'none',
      };

      await persistVisual(visual);
    } catch (removeError) {
      console.error(removeError);

      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove image.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (
          event.target ===
          event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}>

      <div className="modal image-modal">
        <button
          className="modal-close"
          disabled={saving}
          onClick={onClose}>

          <X size={20} />
        </button>

        <div className="modal-icon">
          <ImageIcon size={25} />
        </div>

        <h2>Feed image</h2>

        <p className="image-modal-hook">
          {item.hook}
        </p>

        {previewUrl ? (
          <div className="feed-image-preview">
            <img
              src={previewUrl}
              alt={item.hook}
            />

            <div className="feed-preview-overlay">
              <strong>
                {item.hook}
              </strong>

              <span>
                {item.answer}
              </span>
            </div>
          </div>
        ) : (
          <div className="feed-image-empty">
            <ImageIcon size={34} />

            <span>
              No feed image yet
            </span>
          </div>
        )}

        <div className="image-mode-tabs">
          <button
            className={
              mode === 'upload'
                ? 'active'
                : ''
            }
            disabled={saving}
            onClick={() => {
              setMode('upload');
              setError('');
            }}>

            <Upload size={16} />

            Upload
          </button>

          <button
            className={
              mode === 'external'
                ? 'active'
                : ''
            }
            disabled={saving}
            onClick={() => {
              setMode('external');
              setError('');
            }}>

            <Link2 size={16} />

            External URL
          </button>
        </div>

        {mode === 'upload' ? (
          <div className="image-upload-section">
            <label className="image-upload-drop">
              <Upload size={23} />

              <strong>
                Choose image
              </strong>

              <span>
                JPEG, PNG, WebP, HEIC or another browser-supported image
              </span>

              <span>
                Automatically resized to max 1600px and converted to lightweight WebP
              </span>

              <input
                type="file"
                accept="image/*"
                disabled={saving}
                onChange={event => {
                  setError('');

                  setFile(
                    event.target
                      .files?.[0] ??
                    null,
                  );
                }}
              />
            </label>

            {file && (
              <div className="selected-image-file">
                <span>
                  {file.name}
                </span>

                <span>
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}
                  {' MB source'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="image-url-section">
            <label>
              Image URL
            </label>

            <input
              type="url"
              value={externalUrl}
              disabled={saving}
              placeholder="https://example.com/image.jpg"
              onChange={event => {
                setExternalUrl(
                  event.target.value,
                );

                setError('');
              }}
            />

            <span>
              Use an HTTPS URL that you have permission to display.
            </span>
          </div>
        )}

        {error && (
          <div className="json-error">
            {error}
          </div>
        )}

        <div className="image-modal-actions">
          {currentUrl && (
            <button
              className="danger-text-button"
              disabled={saving}
              onClick={() =>
                void removeImage()
              }>

              <Trash2 size={16} />

              Remove image
            </button>
          )}

          <div className="image-modal-actions-right">
            <button
              className="secondary-button"
              disabled={saving}
              onClick={onClose}>

              Cancel
            </button>

            <button
              className="primary-button"
              disabled={
                saving ||
                (
                  mode === 'upload'
                    ? !file
                    : !externalUrl.trim()
                )
              }
              onClick={() =>
                void (
                  mode === 'upload'
                    ? saveUpload()
                    : saveExternal()
                )
              }>

              {saving
                ? 'Saving…'
                : mode === 'upload'
                  ? 'Upload & Save'
                  : 'Use URL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
