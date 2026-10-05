import {mockCuriosities} from '../data/mock/curiosities';
import {Curiosity} from '../models/Curiosity';
import {CuriosityRepository} from './CuriosityRepository';

export class MockCuriosityRepository
  implements CuriosityRepository {

  async getFeed(): Promise<Curiosity[]> {
    return mockCuriosities.filter(
      item => item.feedEligible,
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
    return curiosity.connections
      .map(connection =>
        mockCuriosities.find(
          item =>
            item.id ===
            connection.curiosityId,
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
        item.feedEligible,
    );
  }
}
