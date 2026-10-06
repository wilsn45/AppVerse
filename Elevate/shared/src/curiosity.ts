export type CuriosityVisualType =
  | 'photo'
  | 'generated'
  | 'illustration'
  | 'diagram'
  | 'archival'
  | 'map'
  | 'portrait';

export type CuriosityImageSource =
  | 'none'
  | 'external'
  | 'uploaded';

export type CuriosityStatus =
  | 'draft'
  | 'review'
  | 'published';

export interface CuriosityExploreNode {
  question: string;
  answer: string;
  children: CuriosityExploreNode[];
}

export interface CuriositySource {
  title: string;
  url: string;
  publisher?: string;
}

export interface CuriosityVisual {
  url: string;
  type: CuriosityVisualType;

  imageSource?: CuriosityImageSource;
  storagePath?: string;

  width?: number;
  height?: number;
  bytes?: number;

  generationPrompt?: string;

  source?: {
    provider: string;
    author?: string;
    sourceUrl?: string;
    license?: string;
  };
}

export interface CuriosityEditorial {
  status: CuriosityStatus;
  factChecked: boolean;
  qualityScore?: number;
  generatedBy?: string;
}

export interface Curiosity {
  id: string;

  hook: string;
  answer: string;
  explanation: string;
  quickFact?: string;

  topicId: string;
  topic: string;

  tags: string[];
  concepts: string[];

  feedEligible: boolean;

  visual: CuriosityVisual;

  /**
   * Plain-text curiosity exploration tree.
   *
   * Main card = depth 0.
   * explore[] = depth 1.
   * Maximum depth below the main card = 3.
   * Maximum children per node = 3.
   */
  explore: CuriosityExploreNode[];

  sources: CuriositySource[];

  editorial: CuriosityEditorial;
}

export type NewCuriosity =
  Omit<Curiosity, 'id'>;
