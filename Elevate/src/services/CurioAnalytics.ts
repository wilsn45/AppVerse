import analytics from '@react-native-firebase/analytics';

const log = async (name: string, params?: Record<string, string | number | boolean>) => {
  try {
    await analytics().logEvent(name, params);
  } catch {
    // Analytics must never interrupt browsing.
  }
};

export const CurioAnalytics = {
  onboardingCompleted: (interestCount: number) => log('curio_onboarding_completed', {interest_count: interestCount}),
  feedLoaded: (itemCount: number, source: string) => log('curio_feed_loaded', {item_count: itemCount, source}),
  contentViewed: (id: string, topic: string, format: string) => log('curio_content_viewed', {content_id: id, topic, format}),
};
