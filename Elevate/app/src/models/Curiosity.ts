export type CuriosityDepth = 0 | 1 | 2;

export interface Curiosity {
  id: string;
  topic: string;
  topicId: string;
  hook: string;
  teaser: string;
  title: string;
  summary: string;
  imageUrl: string;
  depth: CuriosityDepth;
  relatedIds: string[];
  deepDivePrompt?: string;
}
