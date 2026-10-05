import OpenAI from "openai";

import type {
  GeneratedCurio,
} from "../../../domain/generation/GeneratedCurio";
import type {
  GenerateCurioRequest,
} from "../../../domain/generation/GenerateCurioRequest";
import type {
  CurioAIProvider,
} from "../../../domain/providers/CurioAIProvider";

const MODEL = "gpt-6.1-sol";

const SYSTEM_PROMPT = `
You are the content-generation engine for Curio.

Curio is an entertainment-first curiosity product.
The experience should feel like the most interesting feed on a user's phone.

Every Curio must be independently satisfying in the feed.

CONTENT RULES

1. hook
- Ask or state something genuinely curiosity-provoking.
- Avoid clickbait.
- Avoid generic "Did you know?" phrasing.

2. answer
- Directly answer the hook.
- The user must NOT need to open the Curio to discover the basic answer.
- Prefer 1-3 concise sentences.
- Aim for roughly 60-220 characters when practical.

3. explanation
- Add useful context and understanding.
- Do not merely repeat the answer.
- Prefer roughly 45-140 words.

4. quickFact
- Optional.
- Use only when there is a genuinely memorable extra fact.

5. tags
- Produce 2-5 useful descriptive tags.

6. concepts
- Produce 2-5 normalized semantic concepts.
- Use lowercase concise concepts.
- These will later support personalization and duplicate detection.

7. sources
- Do not invent URLs, publications, citations, or sources.
- This generation stage does not perform research.
- Return an empty sources array.
- A later verification stage will attach verified evidence.

8. connections
- Do not invent database IDs.
- Return an empty connections array.
- Connections are resolved later against the Curio knowledge graph.

9. visual
- Choose the best visual TYPE for the Curio.
- Do not invent an image URL.
- Return an empty URL.
- If generated imagery is appropriate, include a useful generationPrompt.
- Otherwise omit generationPrompt.

The result must be factual, concise, interesting, understandable without
specialist knowledge, and suitable for a high-quality consumer product.
`.trim();

const generatedCurioSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    hook: {
      type: "string",
    },
    answer: {
      type: "string",
    },
    explanation: {
      type: "string",
    },
    quickFact: {
      type: ["string", "null"],
    },
    tags: {
      type: "array",
      items: {
        type: "string",
      },
    },
    concepts: {
      type: "array",
      items: {
        type: "string",
      },
    },
    visual: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
        },
        type: {
          type: "string",
          enum: [
            "photo",
            "generated",
            "illustration",
            "diagram",
            "archival",
            "map",
            "portrait",
          ],
        },
        generationPrompt: {
          type: ["string", "null"],
        },
      },
      required: [
        "url",
        "type",
        "generationPrompt",
      ],
    },
    connections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          curiosityId: {
            type: "string",
          },
          relationship: {
            type: "string",
            enum: [
              "deeper",
              "why",
              "how",
              "related",
              "surprising",
            ],
          },
        },
        required: [
          "curiosityId",
          "relationship",
        ],
      },
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
          },
          url: {
            type: "string",
          },
          publisher: {
            type: ["string", "null"],
          },
        },
        required: [
          "title",
          "url",
          "publisher",
        ],
      },
    },
  },
  required: [
    "hook",
    "answer",
    "explanation",
    "quickFact",
    "tags",
    "concepts",
    "visual",
    "connections",
    "sources",
  ],
} as const;

type OpenAIGeneratedCurio = {
  hook: string;
  answer: string;
  explanation: string;
  quickFact: string | null;
  tags: string[];
  concepts: string[];
  visual: {
    url: string;
    type: GeneratedCurio["visual"]["type"];
    generationPrompt: string | null;
  };
  connections: GeneratedCurio["connections"];
  sources: Array<{
    title: string;
    url: string;
    publisher: string | null;
  }>;
};

export class OpenAICurioProvider
implements CurioAIProvider {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
  ) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  async generateCurio(
    request: GenerateCurioRequest,
  ): Promise<GeneratedCurio> {
    const direction = request.direction?.trim();

    const input = [
      `Topic: ${request.topic}`,
      `Topic ID: ${request.topicId}`,
      direction
        ? `Editorial direction: ${direction}`
        : "Editorial direction: Choose the most interesting angle yourself.",
      "",
      "Generate one Curio.",
    ].join("\n");

    const response =
      await this.client.responses.create({
        model: MODEL,

        instructions: SYSTEM_PROMPT,

        input,

        text: {
          format: {
            type: "json_schema",
            name: "generated_curio",
            strict: true,
            schema: generatedCurioSchema,
          },
        },
      });

    if (!response.output_text) {
      throw new Error(
        "OpenAI returned no Curio content.",
      );
    }

    const parsed = JSON.parse(
      response.output_text,
    ) as OpenAIGeneratedCurio;

    return {
      hook: parsed.hook.trim(),
      answer: parsed.answer.trim(),
      explanation: parsed.explanation.trim(),

      ...(parsed.quickFact?.trim()
        ? {
            quickFact:
              parsed.quickFact.trim(),
          }
        : {}),

      tags: parsed.tags.map(value =>
        value.trim(),
      ),

      concepts: parsed.concepts.map(value =>
        value.trim().toLowerCase(),
      ),

      visual: {
        url: parsed.visual.url.trim(),
        type: parsed.visual.type,

        ...(parsed.visual.generationPrompt?.trim()
          ? {
              generationPrompt:
                parsed.visual.generationPrompt.trim(),
            }
          : {}),
      },

      connections: parsed.connections,

      sources: parsed.sources.map(source => ({
        title: source.title.trim(),
        url: source.url.trim(),

        ...(source.publisher?.trim()
          ? {
              publisher:
                source.publisher.trim(),
            }
          : {}),
      })),
    };
  }
}
