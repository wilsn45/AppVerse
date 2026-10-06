import {httpsCallable} from 'firebase/functions';
import {functions} from '../firebase/firebase';

export interface BuildCurioPromptRequest {
  topicId: string;
  topic: string;
  direction?: string;
}

interface BuildCurioPromptResponse {
  prompt: string;
}

export const buildCurioPrompt = async (
  request: BuildCurioPromptRequest,
): Promise<string> => {
  const callable = httpsCallable<
    BuildCurioPromptRequest,
    BuildCurioPromptResponse
  >(
    functions,
    'adminBuildCurioPrompt',
  );

  return (await callable(request)).data.prompt;
};


interface ImportGeneratedCurioRequest {
  topicId: string;
  topic: string;
  generated: Record<string, unknown>;
}

interface ImportGeneratedCurioResponse {
  success: boolean;
  id: string;
}

export const importGeneratedCurio = async (
  request: ImportGeneratedCurioRequest,
): Promise<ImportGeneratedCurioResponse> => {
  const callable = httpsCallable<
    ImportGeneratedCurioRequest,
    ImportGeneratedCurioResponse
  >(
    functions,
    'adminImportGeneratedCurio',
  );

  return (await callable(request)).data;
};


export interface BatchPromptResponse {
  prompt: string;
  categories: number;
  existingCurios: number;
  requestedPerCategory: number;
  requestedTotal: number;
}

export interface BatchImportResult {
  received: number;
  imported: number;
  duplicates: number;
  invalid: number;
  duplicateItems: Array<{
    hook: string;
    reason: string;
  }>;
  invalidItems: Array<{
    index: number;
    reason: string;
  }>;
  ids: string[];
}

export const buildBatchCurioPrompt =
  async (): Promise<BatchPromptResponse> => {
    const callable = httpsCallable<
      void,
      BatchPromptResponse
    >(
      functions,
      'adminBuildBatchCurioPrompt',
    );

    return (await callable()).data;
  };

export const importGeneratedCurioBatch =
  async (
    items: Record<string, unknown>[],
  ): Promise<BatchImportResult> => {
    const callable = httpsCallable<
      {items: Record<string, unknown>[]},
      BatchImportResult
    >(
      functions,
      'adminImportGeneratedCurioBatch',
    );

    return (await callable({items})).data;
  };
