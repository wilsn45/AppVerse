import {
  CheckCircle2,
  Clipboard,
  Sparkles,
} from 'lucide-react';
import {useState} from 'react';

import {
  buildBatchCurioPrompt,
  importGeneratedCurioBatch,
  type BatchImportResult,
  type BatchPromptResponse,
} from '../services/aiStudioService';

interface Props {
  onDraftCreated: () => Promise<void>;
}

export function AIStudioPage({
  onDraftCreated,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [batchJSON, setBatchJSON] = useState('');
  const [promptInfo, setPromptInfo] =
    useState<BatchPromptResponse | null>(null);
  const [result, setResult] =
    useState<BatchImportResult | null>(null);

  const [loadingPrompt, setLoadingPrompt] =
    useState(false);
  const [processing, setProcessing] =
    useState(false);
  const [copied, setCopied] =
    useState(false);
  const [error, setError] =
    useState('');

  const handleGeneratePrompt = async () => {
    try {
      setLoadingPrompt(true);
      setError('');
      setResult(null);

      const response =
        await buildBatchCurioPrompt();

      setPrompt(response.prompt);
      setPromptInfo(response);
      setCopied(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate content prompt.',
      );
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) {
      return;
    }

    await navigator.clipboard.writeText(prompt);

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      1500,
    );
  };

  const parseBatch = (): Record<
    string,
    unknown
  >[] => {
    const raw = batchJSON.trim();

    if (!raw) {
      throw new Error(
        'Paste the ChatGPT JSON array first.',
      );
    }

    let cleaned = raw;

    if (cleaned.startsWith('```')) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');
    }

    const parsed: unknown =
      JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error(
        'ChatGPT response must be one JSON array.',
      );
    }

    if (parsed.length === 0) {
      throw new Error(
        'The JSON array is empty.',
      );
    }

    return parsed.map((item, index) => {
      if (
        !item ||
        typeof item !== 'object' ||
        Array.isArray(item)
      ) {
        throw new Error(
          `Item ${index + 1} is not a JSON object.`,
        );
      }

      return item as Record<
        string,
        unknown
      >;
    });
  };

  const handleProcessBatch = async () => {
    try {
      setProcessing(true);
      setError('');
      setResult(null);

      const items = parseBatch();

      const response =
        await importGeneratedCurioBatch(
          items,
        );

      setResult(response);

      if (response.imported > 0) {
        await onDraftCreated();
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to process Curio batch.',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page ai-studio-page">
      <div className="page-heading simple-heading">
        <div>
          <h1>AI Studio</h1>
          <p>
            Create hundreds of unique Curios with
            one ChatGPT prompt.
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>1. Generate master prompt</h2>

        <p>
          Curio automatically reads all enabled
          categories and your existing Curio library.
          No topic selection is required.
        </p>

        <button
          type="button"
          className="primary-button"
          disabled={loadingPrompt}
          onClick={handleGeneratePrompt}>
          <Sparkles size={18} />

          {loadingPrompt
            ? 'Building prompt...'
            : 'Generate Content Prompt'}
        </button>

        {promptInfo && (
          <p>
            {promptInfo.categories} categories
            {' · '}
            {promptInfo.requestedPerCategory} per category
            {' · '}
            {promptInfo.requestedTotal} Curios requested
            {' · '}
            {promptInfo.existingCurios} existing excluded
          </p>
        )}

        {prompt && (
          <>
            <textarea
              value={prompt}
              readOnly
              rows={16}
            />

            <button
              type="button"
              className="secondary-button"
              onClick={handleCopy}>
              {copied ? (
                <CheckCircle2 size={18} />
              ) : (
                <Clipboard size={18} />
              )}

              {copied
                ? 'Copied'
                : 'Copy Prompt'}
            </button>
          </>
        )}
      </div>

      <div className="panel">
        <h2>2. Paste ChatGPT response</h2>

        <p>
          Paste the complete JSON array returned by
          ChatGPT. Curio will validate it, reject
          duplicates, and save only safe drafts.
        </p>

        <textarea
          value={batchJSON}
          onChange={event =>
            setBatchJSON(
              event.target.value,
            )
          }
          rows={18}
          placeholder='[{"hook":"...","answer":"...", ...}]'
        />

        <button
          type="button"
          className="primary-button"
          disabled={
            processing ||
            !batchJSON.trim()
          }
          onClick={handleProcessBatch}>
          {processing
            ? 'Processing...'
            : 'Process Batch'}
        </button>
      </div>

      {error && (
        <div className="panel">
          <strong>Error</strong>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="panel">
          <h2>Batch result</h2>

          <p>
            Received: {result.received}
            {' · '}
            Imported: {result.imported}
            {' · '}
            Duplicates rejected: {result.duplicates}
            {' · '}
            Invalid rejected: {result.invalid}
          </p>

          {result.duplicateItems.length > 0 && (
            <>
              <h3>Duplicates rejected</h3>

              <ul>
                {result.duplicateItems.map(
                  (item, index) => (
                    <li key={`${item.hook}-${index}`}>
                      {item.hook} — {item.reason}
                    </li>
                  ),
                )}
              </ul>
            </>
          )}

          {result.invalidItems.length > 0 && (
            <>
              <h3>Invalid Curios</h3>

              <ul>
                {result.invalidItems.map(item => (
                  <li key={item.index}>
                    Item {item.index + 1}: {item.reason}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
