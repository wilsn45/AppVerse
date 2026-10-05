import type {
  GeneratedCurio,
} from "../generation/GeneratedCurio";
import type {
  GenerateCurioRequest,
} from "../generation/GenerateCurioRequest";

/**
 * Provider-neutral AI boundary.
 *
 * OpenAI/Gemini/etc. implementations live in infrastructure.
 */
export interface CurioAIProvider {
  generateCurio(
    request: GenerateCurioRequest,
  ): Promise<GeneratedCurio>;
}
