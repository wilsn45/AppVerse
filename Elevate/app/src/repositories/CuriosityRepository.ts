import {Curiosity} from '../models/Curiosity';

export interface CuriosityRepository {
  getFeed(): Promise<Curiosity[]>;
  getCuriosity(id: string): Promise<Curiosity | undefined>;
  getRelatedCuriosities(curiosity: Curiosity): Promise<Curiosity[]>;
  getByTopic(topicId: string): Promise<Curiosity[]>;
}
