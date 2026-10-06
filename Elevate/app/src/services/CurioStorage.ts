import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  onboarded: '@curio/onboarded',
  interests: '@curio/interests',
  seen: '@curio/seen-content',
  saved: '@curio/saved-content',
};

export interface SavedCuriosity {
  id: string;
  savedAt: number;
}

const parseArray = (value: string | null): string[] => {
  if (!value) { return []; }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export const CurioStorage = {
  async isOnboarded(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.onboarded)) === 'true';
  },

  async completeOnboarding(interests: string[]): Promise<void> {
    await AsyncStorage.multiSet([
      [KEYS.interests, JSON.stringify(interests)],
      [KEYS.onboarded, 'true'],
    ]);
  },

  async getInterests(): Promise<string[]> {
    return parseArray(await AsyncStorage.getItem(KEYS.interests));
  },

  async setInterests(interests: string[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.interests, JSON.stringify(interests));
  },

  async getSeenIds(): Promise<string[]> {
    return parseArray(await AsyncStorage.getItem(KEYS.seen));
  },

  async addSeenId(id: string): Promise<void> {
    const seen = await this.getSeenIds();
    const next = [id, ...seen.filter(item => item !== id)].slice(0, 500);
    await AsyncStorage.setItem(KEYS.seen, JSON.stringify(next));
  },

  async getSaved(): Promise<SavedCuriosity[]> {
    try {
      const value = await AsyncStorage.getItem(KEYS.saved);
      if (!value) { return []; }
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async isSaved(id: string): Promise<boolean> {
    return (await this.getSaved()).some(item => item.id === id);
  },

  async toggleSaved(id: string): Promise<boolean> {
    const saved = await this.getSaved();
    const exists = saved.some(item => item.id === id);

    const next = exists
      ? saved.filter(item => item.id !== id)
      : [{id, savedAt: Date.now()}, ...saved];

    await AsyncStorage.setItem(KEYS.saved, JSON.stringify(next));
    return !exists;
  },
};
