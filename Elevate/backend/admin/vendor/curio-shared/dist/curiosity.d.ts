export type CuriosityConnectionType = 'deeper' | 'why' | 'how' | 'related' | 'surprising';
export type CuriosityVisualType = 'photo' | 'generated' | 'illustration' | 'diagram' | 'archival' | 'map' | 'portrait';
export type CuriosityStatus = 'draft' | 'review' | 'published';
export interface CuriosityConnection {
    curiosityId: string;
    relationship: CuriosityConnectionType;
}
export interface CuriositySource {
    title: string;
    url: string;
    publisher?: string;
}
export interface CuriosityVisual {
    url: string;
    type: CuriosityVisualType;
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
    connections: CuriosityConnection[];
    sources: CuriositySource[];
    editorial: CuriosityEditorial;
}
/**
 * Curiosity without its database-generated ID.
 *
 * Used when creating new Curios through the backend.
 */
export type NewCuriosity = Omit<Curiosity, 'id'>;
//# sourceMappingURL=curiosity.d.ts.map