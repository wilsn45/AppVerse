import type {
  GenerateCurioRequest,
} from "../../domain/generation/GenerateCurioRequest";

export class CurioPromptBuilder {
  build(
    request: GenerateCurioRequest,
  ): string {
    const direction =
      request.direction?.trim() ||
      "Choose the most interesting angle yourself.";

    return `
You are generating content for Curio.

Curio is an entertainment-first curiosity app.
The goal is to create something genuinely interesting enough
to stop someone while casually scrolling.

TOPIC
${request.topic}

TOPIC ID
${request.topicId}

EDITORIAL DIRECTION
${direction}

CORE RULE

The Curio must be independently satisfying in the feed.

The user must get the basic answer WITHOUT opening the detail page.

FORMAT

hook:
A genuinely interesting question or statement.
No "Did you know?" phrasing.
No clickbait.

answer:
Directly answer the hook.
Prefer 1-3 concise sentences.
Aim for roughly 60-220 characters when practical.

explanation:
Add deeper context and understanding.
Do not simply repeat the answer.
Prefer roughly 45-140 words.

quickFact:
Optional memorable extra fact.
Use null if there is no genuinely useful extra fact.

tags:
2-5 useful descriptive tags.

concepts:
2-5 concise lowercase semantic concepts.
These are used for personalization and duplicate detection.

visual:
Choose one:
photo
generated
illustration
diagram
archival
map
portrait

Do not invent an image URL.
Set url to "".

If generated imagery would be appropriate,
provide generationPrompt.
Otherwise set generationPrompt to null.

connections:
Return [].
Do not invent Curio/database IDs.

sources:
Return [].
Do not invent sources or URLs.
Sources will be verified separately.

IMPORTANT

Return ONLY valid JSON.

Do not use markdown.
Do not use a code fence.
Do not add commentary before or after the JSON.

Use exactly this structure:

{
  "hook": "string",
  "answer": "string",
  "explanation": "string",
  "quickFact": "string or null",
  "tags": ["string"],
  "concepts": ["string"],
  "visual": {
    "url": "",
    "type": "photo | generated | illustration | diagram | archival | map | portrait",
    "generationPrompt": "string or null"
  },
  "connections": [],
  "sources": []
}
`.trim();
  }
}
