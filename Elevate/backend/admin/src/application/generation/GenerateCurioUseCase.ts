import type {NewCuriosity} from "@curio/shared";
import type {
  GenerateCurioRequest,
} from "../../domain/generation/GenerateCurioRequest";
import type {
  CurioAIProvider,
} from "../../domain/providers/CurioAIProvider";
import type {
  CuriosityRepository,
} from "../../domain/repositories/CuriosityRepository";

export interface GenerateCurioResult {
  id: string;
  curiosity: NewCuriosity;
}

/**
 * Provider-independent Curio business orchestration.
 */
export class GenerateCurioUseCase {
  constructor(
    private readonly aiProvider: CurioAIProvider,
    private readonly repository: CuriosityRepository,
  ) {}

  async execute(
    request: GenerateCurioRequest,
  ): Promise<GenerateCurioResult> {
    const generated =
      await this.aiProvider.generateCurio(request);

    /*
     * Curio owns these decisions.
     * The AI provider does not.
     */
    const draft: NewCuriosity = {
      ...generated,

      topicId: request.topicId,
      topic: request.topic,

      explore: generated.explore ?? [],

      feedEligible: false,

      editorial: {
        status: "draft",
        factChecked: false,
      },
    };

    const saved =
      await this.repository.saveDraft(draft);

    return {
      id: saved.id,
      curiosity: draft,
    };
  }
}
