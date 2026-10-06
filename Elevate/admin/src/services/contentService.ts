import {httpsCallable} from 'firebase/functions';
import {functions} from '../firebase/firebase';
import type {Curiosity} from '@curio/shared';

export type AdminContentItem =
  Curiosity & {
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };

interface ListContentResponse {
  items: AdminContentItem[];
}

interface ImportResponse {
  imported: number;
  ids: string[];
}

export const listContent = async (): Promise<AdminContentItem[]> => {
  const callable = httpsCallable<void, ListContentResponse>(
    functions,
    'adminListContent',
  );

  return (await callable()).data.items;
};

export const importContent = async (
  items: Record<string, unknown>[],
): Promise<ImportResponse> => {
  const callable = httpsCallable<
    {items: Record<string, unknown>[]},
    ImportResponse
  >(functions, 'adminImportContent');

  return (await callable({items})).data;
};

export const updateContent = async (
  id: string,
  content: Record<string, unknown>,
): Promise<void> => {
  const callable = httpsCallable<
    {id: string; content: Record<string, unknown>},
    {success: boolean}
  >(functions, 'adminUpdateContent');

  await callable({id, content});
};

export const deleteContent = async (id: string): Promise<void> => {
  const callable = httpsCallable<
    {id: string},
    {success: boolean}
  >(functions, 'adminDeleteContent');

  await callable({id});
};
