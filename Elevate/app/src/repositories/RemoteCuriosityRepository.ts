import functions from '@react-native-firebase/functions';

import {Curiosity} from '../models/Curiosity';
import {CuriosityRepository} from './CuriosityRepository';

type FeedResponse = {
  items: Curiosity[];
  cursor?: string;
};

export class RemoteCuriosityRepository
  implements CuriosityRepository {

  private cachedItems: Curiosity[] = [];

  async getFeed(): Promise<Curiosity[]> {
    const callable =
      functions().httpsCallable('getCurioFeed');

    const response = await callable({
      interests: [],
      seenContentIds: [],
      limit: 50,
    });

    const data =
      response.data as FeedResponse;

    if (
      !data ||
      !Array.isArray(data.items)
    ) {
      throw new Error(
        'Invalid getCurioFeed response',
      );
    }

    this.cachedItems = data.items;

    return data.items;
  }

  async getCuriosity(
    id: string,
  ): Promise<Curiosity | undefined> {
    let item =
      this.cachedItems.find(
        curiosity =>
          curiosity.id === id,
      );

    if (item) {
      return item;
    }

    await this.getFeed();

    item =
      this.cachedItems.find(
        curiosity =>
          curiosity.id === id,
      );

    return item;
  }

  async getRelatedCuriosities(
    _curiosity: Curiosity,
  ): Promise<Curiosity[]> {
    // The new Curio model uses curiosity.explore
    // instead of connections between separate Curios.
    return [];
  }

  async getByTopic(
    topicId: string,
  ): Promise<Curiosity[]> {
    if (!this.cachedItems.length) {
      await this.getFeed();
    }

    return this.cachedItems.filter(
      item =>
        item.topicId === topicId,
    );
  }
}
