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
