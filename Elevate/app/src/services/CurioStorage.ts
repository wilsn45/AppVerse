import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  onboarded: '@curio/onboarded',
  interests: '@curio/interests',
  seen: '@curio/seen-content',
};

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
  async getSeenIds(): Promise<string[]> {
    return parseArray(await AsyncStorage.getItem(KEYS.seen));
  },
  async addSeenId(id: string): Promise<void> {
    const seen = await this.getSeenIds();
    const next = [id, ...seen.filter(item => item !== id)].slice(0, 500);
    await AsyncStorage.setItem(KEYS.seen, JSON.stringify(next));
  },
};
