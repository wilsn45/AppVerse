import functions from '@react-native-firebase/functions';
import {STARTER_CONTENT} from '../data/starterContent';
import {FeedRequest, FeedResponse} from '../types/content';

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const localFeed = (request: FeedRequest): FeedResponse => {
  const unseen = STARTER_CONTENT.filter(item => !request.seenContentIds.includes(item.id));
  const candidates = unseen.length > 2 ? unseen : STARTER_CONTENT;
  return {
    items: shuffle(candidates)
      .sort((a, b) => Number(request.interests.includes(b.topic)) - Number(request.interests.includes(a.topic)))
      .slice(0, request.limit),
  };
};

export const FeedService = {
  async getFeed(request: FeedRequest): Promise<FeedResponse> {
    try {
      const callable = functions().httpsCallable('getCurioFeed');
      const response = await callable(request);
      const data = response.data as FeedResponse;
      if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        return localFeed(request);
      }
      return data;
    } catch (error) {
      console.warn('Using Curio starter feed while the remote feed is unavailable.', error);
      return localFeed(request);
    }
  },
};
