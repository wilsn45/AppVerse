import {
  CheckCircle2,
  Clipboard,
  Sparkles,
} from 'lucide-react';
import {useEffect, useState} from 'react';

import {
  buildCurioPrompt,
  importGeneratedCurio,
} from '../services/aiStudioService';
import {
  listInterests,
  type AdminInterest,
} from '../services/interestService';

interface Props {
  onDraftCreated: () => Promise<void>;
}

type AIResponse = {
  hook: string;
  answer: string;
  explanation: string;
  quickFact?: string | null;
  tags: string[];
  concepts: string[];
  visual: Record<string, unknown>;
  connections: unknown[];
  sources: unknown[];
};

export function AIStudioPage({
  onDraftCreated,
}: Props) {
  const [interests, setInterests] =
    useState<AdminInterest[]>([]);

  const [topicId, setTopicId] = useState('');
  const [topic, setTopic] = useState('');
  const [direction, setDirection] = useState('');

  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAIResponse] = useState('');

  const [building, setBuilding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const values = await listInterests();

        setInterests(
          values.filter(item => item.enabled !== false),
        );
      } catch (loadError) {
        console.error(loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load topics.',
        );
      }
    };

    void load();
  }, []);

  const selectTopic = (
    selectedId: string,
  ) => {
    setTopicId(selectedId);

    const selected = interests.find(
      item => item.id === selectedId,
    );

    setTopic(selected?.title ?? '');

    setPrompt('');
    setSuccess('');
    setError('');
  };

  const handleBuildPrompt = async () => {
    if (!topicId || !topic) {
      setError('Select a topic first.');
      return;
    }

    try {
      setBuilding(true);
      setError('');
      setSuccess('');

      const generatedPrompt =
        await buildCurioPrompt({
          topicId,
          topic,
          ...(direction.trim()
            ? {direction: direction.trim()}
            : {}),
        });

      setPrompt(generatedPrompt);
    } catch (buildError) {
      console.error(buildError);

      setError(
        buildError instanceof Error
          ? buildError.message
          : 'Unable to generate prompt.',
      );
    } finally {
      setBuilding(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) {
      return;
    }

    await navigator.clipboard.writeText(prompt);

    setSuccess(
      'Prompt copied. Paste it into ChatGPT.',
    );
  };

  const parseAIResponse = (): AIResponse => {
    const parsed: unknown =
      JSON.parse(aiResponse);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        'AI response must be one JSON object.',
      );
    }

    const value =
      parsed as Record<string, unknown>;

    for (const field of [
      'hook',
      'answer',
      'explanation',
    ]) {
      if (
        typeof value[field] !== 'string' ||
        !String(value[field]).trim()
      ) {
        throw new Error(
          `AI response requires "${field}".`,
        );
      }
    }

    for (const field of [
      'tags',
      'concepts',
      'connections',
      'sources',
    ]) {
      if (!Array.isArray(value[field])) {
        throw new Error(
          `"${field}" must be an array.`,
        );
      }
    }

    if (
      !value.visual ||
      typeof value.visual !== 'object' ||
      Array.isArray(value.visual)
    ) {
      throw new Error(
        '"visual" must be an object.',
      );
    }

    return value as AIResponse;
  };

  const handleCreateDraft = async () => {
    if (!topicId || !topic) {
      setError('Select a topic first.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const generated =
        parseAIResponse();

      await importGeneratedCurio({
        topicId,
        topic,
        generated: generated as unknown as Record<string, unknown>,
      });

      setAIResponse('');
      setPrompt('');
      setDirection('');

      setSuccess(
        'Curio draft created successfully.',
      );

      await onDraftCreated();
    } catch (saveError) {
      console.error(saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to create draft.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page ai-studio-page">
      <div className="page-heading simple-heading">
        <div>
          <h1>AI Studio</h1>
          <p>
            Generate Curio content with your AI assistant,
            then review it before publishing.
          </p>
        </div>
      </div>

      <div className="ai-workflow">
        <section className="ai-card">
          <div className="ai-card-heading">
            <div className="ai-step">1</div>

            <div>
              <h2>Build Prompt</h2>
              <p>
                Choose what you want Curio to explore.
              </p>
            </div>
          </div>

          <div className="ai-form">
            <label>
              Topic

              <select
                value={topicId}
                onChange={event =>
                  selectTopic(event.target.value)
                }>
                <option value="">
                  Select a topic
                </option>

                {interests.map(item => (
                  <option
                    key={item.id}
                    value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Direction
              <span className="field-hint">
                Optional
              </span>

              <textarea
                value={direction}
                onChange={event =>
                  setDirection(event.target.value)
                }
                placeholder="e.g. Something surprising about memory"
              />
            </label>

            <button
              className="primary-button"
              disabled={building || !topicId}
              onClick={() =>
                void handleBuildPrompt()
              }>
              <Sparkles size={18} />

              {building
                ? 'Building…'
                : 'Generate Prompt'}
            </button>
          </div>
        </section>

        <section className="ai-card">
          <div className="ai-card-heading">
            <div className="ai-step">2</div>

            <div>
              <h2>Ask ChatGPT</h2>
              <p>
                Copy this prompt and paste it into ChatGPT.
              </p>
            </div>
          </div>

          <textarea
            className="ai-code-area"
            value={prompt}
            readOnly
            placeholder="Your generated prompt will appear here."
          />

          <button
            className="secondary-button"
            disabled={!prompt}
            onClick={() =>
              void handleCopyPrompt()
            }>
            <Clipboard size={18} />
            Copy Prompt
          </button>
        </section>

        <section className="ai-card">
          <div className="ai-card-heading">
            <div className="ai-step">3</div>

            <div>
              <h2>Create Draft</h2>
              <p>
                Paste the JSON returned by ChatGPT.
              </p>
            </div>
          </div>

          <textarea
            className="ai-code-area response"
            value={aiResponse}
            onChange={event => {
              setAIResponse(event.target.value);
              setError('');
              setSuccess('');
            }}
            placeholder={'{\n  "hook": "...",\n  "answer": "..."\n}'}
          />

          <button
            className="primary-button"
            disabled={
              saving ||
              !topicId ||
              !aiResponse.trim()
            }
            onClick={() =>
              void handleCreateDraft()
            }>
            <CheckCircle2 size={18} />

            {saving
              ? 'Creating Draft…'
              : 'Validate & Create Draft'}
          </button>
        </section>
      </div>

      {error && (
        <div className="ai-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="ai-message success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}
    </div>
  );
}
