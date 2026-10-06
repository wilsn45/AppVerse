import type {
  Curiosity,
  NewCuriosity,
} from "@curio/shared";

export interface SaveCuriosityResult {
  id: string;
}

/**
 * Persistence boundary for Curio content.
 *
 * Application/domain code must depend on this interface,
 * never directly on Firestore, DynamoDB, PostgreSQL, etc.
 */
export interface CuriosityRepository {
  saveDraft(
    curiosity: NewCuriosity,
  ): Promise<SaveCuriosityResult>;

  findById(
    id: string,
  ): Promise<Curiosity | null>;

  findByConcepts(
    concepts: string[],
    limit?: number,
  ): Promise<Curiosity[]>;
}
