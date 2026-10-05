import * as admin from "firebase-admin";
import type {
  Curiosity,
  NewCuriosity,
} from "@curio/shared";
import type {
  CuriosityRepository,
  SaveCuriosityResult,
} from "../../../domain/repositories/CuriosityRepository";

const CONTENT_COLLECTION = "content";

export class FirestoreCuriosityRepository
implements CuriosityRepository {
  constructor(
    private readonly db: admin.firestore.Firestore,
  ) {}

  async saveDraft(
    curiosity: NewCuriosity,
  ): Promise<SaveCuriosityResult> {
    const now =
      admin.firestore.FieldValue.serverTimestamp();

    const document = await this.db
      .collection(CONTENT_COLLECTION)
      .add({
        ...curiosity,
        editorial: {
          ...curiosity.editorial,
          status: "draft",
          factChecked: false,
        },
        createdAt: now,
        updatedAt: now,
      });

    return {
      id: document.id,
    };
  }

  async findById(
    id: string,
  ): Promise<Curiosity | null> {
    const snapshot = await this.db
      .collection(CONTENT_COLLECTION)
      .doc(id)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Curiosity;
  }

  async findByConcepts(
    concepts: string[],
    limit = 50,
  ): Promise<Curiosity[]> {
    const normalizedConcepts = [
      ...new Set(
        concepts
          .map(concept =>
            concept.trim().toLowerCase(),
          )
          .filter(Boolean),
      ),
    ];

    if (normalizedConcepts.length === 0) {
      return [];
    }

    /*
     * Firestore array-contains-any currently supports
     * only a bounded number of comparison values.
     *
     * Keep the repository boundary responsible for
     * Firestore-specific query constraints.
     */
    const queryConcepts =
      normalizedConcepts.slice(0, 10);

    const snapshot = await this.db
      .collection(CONTENT_COLLECTION)
      .where(
        "concepts",
        "array-contains-any",
        queryConcepts,
      )
      .limit(limit)
      .get();

    return snapshot.docs.map(document => ({
      id: document.id,
      ...document.data(),
    })) as Curiosity[];
  }
}
