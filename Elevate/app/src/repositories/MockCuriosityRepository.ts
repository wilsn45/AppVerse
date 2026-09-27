import {mockCuriosities} from '../data/mock/curiosities';
import {Curiosity} from '../models/Curiosity';
import {CuriosityRepository} from './CuriosityRepository';

export class MockCuriosityRepository
  implements CuriosityRepository {

  async getFeed(): Promise<Curiosity[]> {
    return mockCuriosities.filter(
      item => item.depth === 0,
    );
  }

  async getCuriosity(
    id: string,
  ): Promise<Curiosity | undefined> {
    return mockCuriosities.find(
      item => item.id === id,
    );
  }

  async getRelatedCuriosities(
    curiosity: Curiosity,
  ): Promise<Curiosity[]> {
    return curiosity.relatedIds
      .map(id =>
        mockCuriosities.find(
          item => item.id === id,
        ),
      )
      .filter(
        (
          item,
        ): item is Curiosity =>
          item !== undefined,
      );
  }

  async getByTopic(
    topicId: string,
  ): Promise<Curiosity[]> {
    return mockCuriosities.filter(
      item =>
        item.topicId === topicId &&
        item.depth === 0,
    );
  }
}
