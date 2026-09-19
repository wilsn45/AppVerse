import {httpsCallable} from 'firebase/functions';
import {functions} from '../firebase/firebase';

export interface AdminInterest {
  id: string;
  title: string;
  iconUrl?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface InterestListResponse {
  items: AdminInterest[];
}

export const listInterests = async (): Promise<AdminInterest[]> => {
  const callable = httpsCallable<void, InterestListResponse>(
    functions,
    'adminListInterests',
  );

  return (await callable()).data.items;
};

export const createInterest = async (
  title: string,
  iconUrl?: string,
): Promise<{id: string; title: string}> => {
  const callable = httpsCallable<
    {title: string; iconUrl?: string},
    {id: string; title: string}
  >(
    functions,
    'adminCreateInterest',
  );

  const payload: {
    title: string;
    iconUrl?: string;
  } = {title};

  if (iconUrl?.trim()) {
    payload.iconUrl = iconUrl.trim();
  }

  return (await callable(payload)).data;
};

export const updateInterest = async (
  id: string,
  title: string,
  iconUrl?: string,
): Promise<void> => {
  const callable = httpsCallable<
    {
      id: string;
      title: string;
      iconUrl?: string;
    },
    {success: boolean}
  >(
    functions,
    'adminUpdateInterest',
  );

  await callable({
    id,
    title,
    iconUrl: iconUrl?.trim() || undefined,
  });
};
