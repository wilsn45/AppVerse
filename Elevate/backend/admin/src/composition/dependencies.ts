import * as admin from "firebase-admin";

import {
  GenerateCurioUseCase,
} from "../application/generation/GenerateCurioUseCase";
import {
  OpenAICurioProvider,
} from "../infrastructure/ai/openai/OpenAICurioProvider";
import {
  FirestoreCuriosityRepository,
} from "../infrastructure/persistence/firestore/FirestoreCuriosityRepository";

export interface CurioDependencies {
  generateCurioUseCase: GenerateCurioUseCase;
}

/**
 * Composition root.
 *
 * This is where we choose the infrastructure implementations
 * Curio uses today.
 *
 * Replacing OpenAI or Firestore should primarily mean changing
 * this wiring, not Curio's application/domain logic.
 */
export const createCurioDependencies = (
  openAIApiKey: string,
): CurioDependencies => {
  const repository =
    new FirestoreCuriosityRepository(
      admin.firestore(),
    );

  const aiProvider =
    new OpenAICurioProvider(
      openAIApiKey,
    );

  const generateCurioUseCase =
    new GenerateCurioUseCase(
      aiProvider,
      repository,
    );

  return {
    generateCurioUseCase,
  };
};
