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

IMAGE GENERATION PROMPT RULES

When generationPrompt is not null, write it as a complete
standalone image-generation instruction.

The Curio feed image is displayed in a 4:3 landscape frame.

Design the image specifically for a 4:3 landscape composition.
Target generation size: 1600x1200 pixels.

Keep the main subject and all essential visual information
inside the central safe area so the image still looks good
if a device applies a small crop.

Do not place important subjects against the extreme edges.

Do not generate text, captions, labels, logos, UI elements,
watermarks, or borders inside the image unless the Curio
specifically requires a diagram where labels are essential.

Prefer a clear focal subject, strong visual storytelling,
and mobile-readable composition.

generationPrompt must describe the actual image to create,
not merely repeat the Curio hook.

EXPLORE

Generate a natural exploration tree for the Curio.

The main Curio is depth 0.

explore contains Level 1 follow-up questions.

Every exploration node must contain ONLY:

question
answer
children

Each node may contain 0 to 3 children.

Maximum depth below the main Curio is 3 levels:

Level 1
-> Level 2
-> Level 3
-> STOP

Every Level 3 node MUST have:

"children": []

Do NOT force every node to have children.

Stop a branch naturally when there is no genuinely
interesting follow-up question.

Follow-up questions should feel like natural human curiosity:
"But why?"
"How does that work?"
"What happened next?"
"Does that mean...?"
"What is surprising about that?"

Every answer must directly answer its own question.

Child nodes are plain text.

Do NOT put any of these inside child nodes:

id
topic
topicId
tags
concepts
visual
image
sources
editorial
feedEligible

Keep the complete exploration tree tightly connected
to the main Curio.

Do not wander into unrelated trivia.

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
  "explore": [
    {
      "question": "Level 1 question",
      "answer": "Direct answer",
      "children": [
        {
          "question": "Level 2 question",
          "answer": "Direct answer",
          "children": [
            {
              "question": "Level 3 question",
              "answer": "Direct answer",
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "sources": []
}
`.trim();
  }
}
