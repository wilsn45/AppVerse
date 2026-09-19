export type ContentOrigin = 'evergreen' | 'trending';

export type ContentFormat =
  | 'microFact'
  | 'visualFact'
  | 'story'
  | 'perspective'
  | 'thenAndNow'
  | 'explanation'
  | 'thought'
  | 'imageDiscovery'
  | 'internetMoment'
  | 'buzz'
  | 'current'
  | 'choice'
  | 'reveal';

export interface ContentVisual {
  type: 'image' | 'illustration' | 'graphic' | 'icon' | 'none';
  url?: string;
  emoji?: string;
}

export interface ContentChoice {
  id: string;
  label: string;
  emoji?: string;
  percentage?: number;
}

export interface ContentItem {
  id: string;
  topic: string;
  tags: string[];
  format: ContentFormat;
  origin: ContentOrigin;
  hook: string;
  body?: string;
  visual?: ContentVisual;
  choices?: ContentChoice[];
  revealText?: string;
  sourceNames?: string[];
  sourceUrls?: string[];
  publishedAt?: string;
  expiresAt?: string;
  status: 'draft' | 'published' | 'archived';
  qualityScore?: number;
  accent?: string;
}

export interface FeedRequest {
  interests: string[];
  seenContentIds: string[];
  limit: number;
  cursor?: string;
}

export interface FeedResponse {
  items: ContentItem[];
  cursor?: string;
}
