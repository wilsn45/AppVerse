import * as admin from "firebase-admin";
import {HttpsError, onCall} from "firebase-functions/v2/https";
import type {NewCuriosity} from "@curio/shared";

admin.initializeApp();

const db = admin.firestore();

const ADMIN_UIDS = new Set([
  "l8SqZz2AOYfECNnlTnae0PhpjYI2",
]);

const requireAdmin = (uid?: string): void => {
  if (!uid || !ADMIN_UIDS.has(uid)) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
};

const normalizeValue = (value: unknown): unknown => {
  if (value instanceof admin.firestore.Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        normalizeValue(nested),
      ]),
    );
  }

  return value;
};

type SerializedDocument = {
  id: string;
  [key: string]: unknown;
};

const serializeDocument = (
  document: admin.firestore.QueryDocumentSnapshot,
): SerializedDocument => ({
  id: document.id,
  ...Object.fromEntries(
    Object.entries(document.data()).map(([key, value]) => [
      key,
      normalizeValue(value),
    ]),
  ),
});

const requireObject = (
  value: unknown,
  message = "Expected a JSON object.",
): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", message);
  }

  return value as Record<string, unknown>;
};

const validateContent = (
  value: unknown,
): NewCuriosity => {
  const item = requireObject(
    value,
    "Each Curio must be an object.",
  );

  const requireString = (
    key: string,
  ): string => {
    const value = item[key];

    if (
      typeof value !== "string" ||
      !value.trim()
    ) {
      throw new HttpsError(
        "invalid-argument",
        `Curio requires "${key}".`,
      );
    }

    return value.trim();
  };

  const requireStringArray = (
    key: string,
  ): string[] => {
    const value = item[key];

    if (
      !Array.isArray(value) ||
      value.some(
        entry =>
          typeof entry !== "string" ||
          !entry.trim(),
      )
    ) {
      throw new HttpsError(
        "invalid-argument",
        `Curio requires "${key}" to be a string array.`,
      );
    }

    return value as string[];
  };

  requireString("hook");
  requireString("answer");
  requireString("explanation");
  requireString("topicId");
  requireString("topic");

  requireStringArray("tags");
  requireStringArray("concepts");

  if (typeof item.feedEligible !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      'Curio requires boolean "feedEligible".',
    );
  }

  const visual = requireObject(
    item.visual,
    'Curio requires "visual".',
  );

  const visualTypes = new Set([
    "photo",
    "generated",
    "illustration",
    "diagram",
    "archival",
    "map",
    "portrait",
  ]);

  if (
    typeof visual.type !== "string" ||
    !visualTypes.has(visual.type)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Curio has an invalid visual type.",
    );
  }

  if (typeof visual.url !== "string") {
    throw new HttpsError(
      "invalid-argument",
      'Curio visual requires string "url".',
    );
  }

  if (
    visual.imageSource !== undefined &&
    visual.imageSource !== "none" &&
    visual.imageSource !== "external" &&
    visual.imageSource !== "uploaded"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Curio visual has an invalid imageSource.",
    );
  }

  if (
    visual.storagePath !== undefined &&
    typeof visual.storagePath !== "string"
  ) {
    throw new HttpsError(
      "invalid-argument",
      'Curio visual "storagePath" must be a string.',
    );
  }

  for (
    const key of [
      "width",
      "height",
      "bytes",
    ]
  ) {
    const value = visual[key];

    if (
      value !== undefined &&
      (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value <= 0
      )
    ) {
      throw new HttpsError(
        "invalid-argument",
        `Curio visual "${key}" must be a positive number.`,
      );
    }
  }

  const validateExploreNodes = (
    value: unknown,
    depth: number,
  ): void => {
    if (!Array.isArray(value)) {
      throw new HttpsError(
        "invalid-argument",
        'Curio requires "explore" to be an array.',
      );
    }

    if (value.length > 3) {
      throw new HttpsError(
        "invalid-argument",
        `Explore depth ${depth} may contain at most 3 questions.`,
      );
    }

    for (const rawNode of value) {
      const node = requireObject(
        rawNode,
        "Every explore node must be an object.",
      );

      if (
        typeof node.question !== "string" ||
        !node.question.trim()
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Every explore node requires a question.",
        );
      }

      if (
        typeof node.answer !== "string" ||
        !node.answer.trim()
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Every explore node requires an answer.",
        );
      }

      if (!Array.isArray(node.children)) {
        throw new HttpsError(
          "invalid-argument",
          "Every explore node requires children[].",
        );
      }

      if (depth >= 3) {
        if (node.children.length !== 0) {
          throw new HttpsError(
            "invalid-argument",
            "Explore trees may not exceed 3 levels below the main Curio.",
          );
        }

        continue;
      }

      validateExploreNodes(
        node.children,
        depth + 1,
      );
    }
  };

  validateExploreNodes(
    item.explore,
    1,
  );

  if (!Array.isArray(item.sources)) {
    throw new HttpsError(
      "invalid-argument",
      'Curio requires "sources".',
    );
  }

  const editorial = requireObject(
    item.editorial,
    'Curio requires "editorial".',
  );

  if (
    editorial.status !== "draft" &&
    editorial.status !== "review" &&
    editorial.status !== "published"
  ) {
    throw new HttpsError(
      "invalid-argument",
      'Editorial status must be "draft", "review", or "published".',
    );
  }

  if (
    typeof editorial.factChecked !== "boolean"
  ) {
    throw new HttpsError(
      "invalid-argument",
      'Editorial requires boolean "factChecked".',
    );
  }

  /*
   * Publishing gate.
   *
   * Drafts/review items may still be incomplete.
   * Published Curios must satisfy our minimum
   * editorial requirements.
   */
  if (editorial.status === "published") {
    if (!editorial.factChecked) {
      throw new HttpsError(
        "failed-precondition",
        "Published Curios must be fact checked.",
      );
    }

    if (item.sources.length === 0) {
      throw new HttpsError(
        "failed-precondition",
        "Published Curios require at least one source.",
      );
    }

    if (!item.feedEligible) {
      throw new HttpsError(
        "failed-precondition",
        "Published Curios must be feed eligible.",
      );
    }
  }

  return item as unknown as NewCuriosity;
};

export const adminListContent = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const snapshot = await db
      .collection("content")
      .limit(500)
      .get();

    const items = snapshot.docs
      .map(serializeDocument)
      .sort((a, b) => {
        const aDate = Date.parse(String(a.createdAt ?? a.publishedAt ?? ""));
        const bDate = Date.parse(String(b.createdAt ?? b.publishedAt ?? ""));

        return (Number.isNaN(bDate) ? 0 : bDate) -
          (Number.isNaN(aDate) ? 0 : aDate);
      });

    return {items};
  },
);

export const adminImportContent = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(request.data);
    const rawItems = data.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "items must be a non-empty array.",
      );
    }

    if (rawItems.length > 200) {
      throw new HttpsError(
        "invalid-argument",
        "A maximum of 200 items can be imported at once.",
      );
    }

    const items = rawItems.map(validateContent);
    const batch = db.batch();
    const ids: string[] = [];

    for (const item of items) {
      const ref = db.collection("content").doc();
      ids.push(ref.id);

      batch.set(ref, {
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      imported: ids.length,
      ids,
    };
  },
);


/**
 * Imports one Curio generated through the manual AI Studio workflow.
 *
 * The AI response is deliberately not trusted with publication state.
 * Editorial and feed eligibility are owned by the backend.
 */
export const adminImportGeneratedCurio = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(request.data);

    if (
      typeof data.topicId !== "string" ||
      !data.topicId.trim()
    ) {
      throw new HttpsError(
        "invalid-argument",
        "topicId is required.",
      );
    }

    if (
      typeof data.topic !== "string" ||
      !data.topic.trim()
    ) {
      throw new HttpsError(
        "invalid-argument",
        "topic is required.",
      );
    }

    const generated = requireObject(
      data.generated,
      "generated Curio is required.",
    );

    /*
     * Security boundary:
     *
     * Never trust AI-provided topic, feed eligibility,
     * publication status, or fact-check state.
     */
    const safeDraft = {
      ...generated,

      topicId: data.topicId.trim(),
      topic: data.topic.trim(),

      feedEligible: false,

      editorial: {
        status: "draft",
        factChecked: false,
        generatedBy: "manual-ai",
      },
    };

    const validated = validateContent(safeDraft);

    const ref = db.collection("content").doc();

    await ref.set({
      ...validated,

      /*
       * Keep this explicit even after validation so the persisted
       * publication state can never be controlled by pasted AI JSON.
       */
      feedEligible: false,

      editorial: {
        ...validated.editorial,
        status: "draft",
        factChecked: false,
        generatedBy: "manual-ai",
      },

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      id: ref.id,
    };
  },
);


const normalizeCurioText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const curioConceptSet = (
  value: unknown,
): Set<string> => {
  if (!Array.isArray(value)) {
    return new Set();
  }

  return new Set(
    value
      .filter(
        entry =>
          typeof entry === "string" &&
          entry.trim(),
      )
      .map(entry =>
        normalizeCurioText(String(entry)),
      )
      .filter(Boolean),
  );
};

const conceptSimilarity = (
  left: Set<string>,
  right: Set<string>,
): number => {
  if (!left.size || !right.size) {
    return 0;
  }

  let intersection = 0;

  for (const value of left) {
    if (right.has(value)) {
      intersection += 1;
    }
  }

  const union =
    new Set([...left, ...right]).size;

  return union === 0
    ? 0
    : intersection / union;
};

const areCuriosDuplicate = (
  left: Record<string, unknown>,
  right: Record<string, unknown>,
): boolean => {
  const leftHook =
    typeof left.hook === "string"
      ? normalizeCurioText(left.hook)
      : "";

  const rightHook =
    typeof right.hook === "string"
      ? normalizeCurioText(right.hook)
      : "";

  if (
    leftHook &&
    rightHook &&
    leftHook === rightHook
  ) {
    return true;
  }

  const leftConcepts =
    curioConceptSet(left.concepts);

  const rightConcepts =
    curioConceptSet(right.concepts);

  return conceptSimilarity(
    leftConcepts,
    rightConcepts,
  ) >= 0.6;
};

/**
 * Builds one master prompt for manual ChatGPT generation.
 *
 * No topic selection is required. The backend reads enabled
 * interests and the existing Curio library automatically.
 */
export const adminBuildBatchCurioPrompt = onCall(
  {region: "us-central1", cors: true},
  async request => {
    requireAdmin(request.auth?.uid);

    const [
      interestSnapshot,
      contentSnapshot,
    ] = await Promise.all([
      db.collection("interests").get(),
      db.collection("content").limit(500).get(),
    ]);

    const interests = interestSnapshot.docs
      .map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          title:
            typeof data.title === "string"
              ? data.title.trim()
              : "",
          enabled: data.enabled !== false,
        };
      })
      .filter(
        item =>
          item.enabled &&
          item.title,
      )
      .sort((a, b) =>
        a.title.localeCompare(b.title),
      );

    if (!interests.length) {
      throw new HttpsError(
        "failed-precondition",
        "No enabled Curio categories were found.",
      );
    }

    const existing = contentSnapshot.docs
      .map(doc => {
        const data = doc.data();

        return {
          hook:
            typeof data.hook === "string"
              ? data.hook.trim()
              : "",
          topic:
            typeof data.topic === "string"
              ? data.topic.trim()
              : "",
          concepts: Array.isArray(data.concepts)
            ? data.concepts
                .filter(
                  value =>
                    typeof value === "string",
                )
                .map(String)
            : [],
        };
      })
      .filter(item => item.hook);

    const categoryText = interests
      .map(
        item =>
          `- ${item.title} | topicId: ${item.id}`,
      )
      .join("\n");

    const existingText = existing.length
      ? existing
          .map(
            item =>
              `- [${item.topic}] ${item.hook}` +
              (
                item.concepts.length
                  ? ` | concepts: ${item.concepts.join(", ")}`
                  : ""
              ),
          )
          .join("\n")
      : "- No existing Curios yet.";

    const prompt = `You are the senior editorial content engine for Curio.

Curio is an entertainment-first curiosity app whose goal is:
"The most interesting feed on your phone."

YOUR TASK

Generate approximately 50 UNIQUE MAIN Curios across the categories listed below.

Distribute them broadly across the available categories.

Every main Curio MUST include its complete curiosity exploration tree.

Every Curio must teach a genuinely interesting fact, phenomenon, story, idea, misconception, mechanism, historical event, scientific observation, cultural curiosity, technological curiosity, or surprising piece of knowledge.

The user must get the core answer directly in the feed. Never hide the answer behind the detail screen.

CATEGORIES

${categoryText}

EXISTING CURIO LIBRARY

The following Curios already exist.

DO NOT generate the same underlying fact, phenomenon, story, concept, event, mechanism, or idea again, even if you can phrase the hook differently.

${existingText}

CRITICAL DUPLICATE RULES

1. Every generated Curio must be semantically different from every existing Curio above.
2. Every generated Curio must also be semantically different from every other Curio in THIS response.
3. Rewording an existing fact does NOT make it unique.
4. Two hooks about the same underlying phenomenon are duplicates.
5. Before returning your answer, internally compare the entire generated set and remove/replace duplicates.
6. Prefer breadth and surprising subject diversity.
7. concepts[] must describe the actual underlying concepts accurately. These fields are used by Curio's duplicate detector.
8. Do not generate multiple Curios merely because one subject has several slightly different phrasings.

EDITORIAL STANDARD

- hook: compelling natural-language question or statement.
- answer: direct answer visible in the feed.
- answer should preferably be 60-220 characters.

IMAGE / VISUAL RULES

Every main Curio has one visual object.

Set visual.url to "".
Never invent an image URL.

If generated imagery is appropriate, generationPrompt must be
a complete standalone image-generation instruction.

The Curio feed uses a 4:3 landscape image frame.

Every generationPrompt MUST explicitly request:
- 4:3 landscape composition
- target size 1600x1200 pixels
- the primary subject inside the central safe area
- no essential visual information at extreme edges
- a composition that remains strong after a small responsive crop
- no text, captions, logos, UI, borders, or watermarks unless
  labels are genuinely required for a diagram
- a clear focal subject readable on both phones and tablets

generationPrompt must describe the actual scene/image to generate,
not simply repeat the Curio hook.
- explanation: useful deeper context, approximately 45-140 words.
- quickFact: optional additional surprising fact, otherwise null.
- tags: 2-5 useful tags.
- concepts: 2-5 precise semantic concepts.
- No clickbait.
- No motivational filler.
- No generic textbook definitions.
- No trivia whose only value is memorizing a number.
- Avoid claims you are not confident are factual.
- Do not invent URLs or sources.
EXPLORATION TREE RULES

Every main Curio must contain an "explore" array.

The main Curio is depth 0.

explore[] contains Level 1 follow-up questions.

Each exploration node has ONLY:
- question
- answer
- children

Each node may have 0 to 3 children.

Maximum exploration depth below the main Curio is exactly 3 levels:
Level 1 -> Level 2 -> Level 3 -> STOP.

Level 3 nodes MUST always have children: [].

Do NOT force 3 children.
Generate only genuinely interesting, natural follow-up questions.

The exploration should feel like a person repeatedly asking:
"But why?"
"How does that work?"
"What happened next?"
"Does that mean...?"
"What is surprising about that?"

Every child answer must directly answer its own question.

Children are plain text.
Do NOT add images, topics, tags, concepts, IDs, sources,
editorial metadata, or visual metadata to child nodes.

The entire tree must remain tightly related to the MAIN Curio.

Do not wander into weakly related trivia.

- sources must be [] for this generation stage.
- visual.url must be "".
- Choose the best visual.type from:
  photo
  generated
  illustration
  diagram
  archival
  map
  portrait
- visual.generationPrompt may contain a useful image-generation description when appropriate.

OUTPUT FORMAT

Return ONLY one valid JSON array.

No markdown.
No code fences.
No commentary before or after the JSON.

Every object MUST have exactly this content structure:

{
  "hook": "string",
  "answer": "string",
  "explanation": "string",
  "quickFact": "string or null",
  "topicId": "EXACT topicId supplied above",
  "topic": "EXACT category title supplied above",
  "tags": ["string"],
  "concepts": ["string"],
  "visual": {
    "url": "",
    "type": "photo | generated | illustration | diagram | archival | map | portrait",
    "generationPrompt": "string"
  },
  "explore": [
    {
      "question": "natural follow-up question",
      "answer": "direct useful answer",
      "children": [
        {
          "question": "natural level-2 follow-up",
          "answer": "direct useful answer",
          "children": [
            {
              "question": "natural level-3 follow-up",
              "answer": "direct useful answer",
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "sources": []
}

Do NOT include:
feedEligible
editorial
status
factChecked
id
createdAt
updatedAt

Curio's backend owns those fields.

FINAL SELF-CHECK BEFORE RESPONDING

- Approximately 50 MAIN Curios total.
- Broad category distribution.
- Correct topicId/category pairing.
- Every main Curio contains explore[].
- Maximum 3 children per node.
- Maximum 3 levels below main card.
- Every Level 3 node has children: [].
- No duplicate underlying concepts.
- No overlap with EXISTING CURIO LIBRARY.
- Every hook has its answer directly in answer.
- Valid JSON.
- One JSON array only.`;

    return {
      prompt,
      categories: interests.length,
      existingCurios: existing.length,
      requestedPerCategory: 0,
      requestedTotal: 50,
    };
  },
);

/**
 * Imports a manually-generated Curio batch.
 *
 * Publication state is controlled exclusively by the backend.
 * Exact-hook and concept-overlap duplicate protection is applied
 * against both the existing library and the incoming batch.
 */
export const adminImportGeneratedCurioBatch = onCall(
  {region: "us-central1", cors: true},
  async request => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(request.data);
    const rawItems = data.items;

    if (
      !Array.isArray(rawItems) ||
      rawItems.length === 0
    ) {
      throw new HttpsError(
        "invalid-argument",
        "items must be a non-empty JSON array.",
      );
    }

    if (rawItems.length > 400) {
      throw new HttpsError(
        "invalid-argument",
        "A maximum of 400 generated Curios can be processed at once.",
      );
    }

    const existingSnapshot =
      await db
        .collection("content")
        .limit(500)
        .get();

    const existing =
      existingSnapshot.docs.map(
        doc => doc.data() as Record<string, unknown>,
      );

    const accepted:
      Array<ReturnType<typeof validateContent>> = [];

    const duplicateItems:
      Array<{
        hook: string;
        reason: string;
      }> = [];

    const invalidItems:
      Array<{
        index: number;
        reason: string;
      }> = [];

    for (
      let index = 0;
      index < rawItems.length;
      index += 1
    ) {
      try {
        const generated = requireObject(
          rawItems[index],
          `Curio at index ${index} must be an object.`,
        );

        const safeDraft = {
          ...generated,

          feedEligible: false,

          editorial: {
            status: "draft",
            factChecked: false,
            generatedBy: "manual-ai-batch",
          },
        };

        const validated =
          validateContent(safeDraft);

        const comparable =
          validated as unknown as Record<
            string,
            unknown
          >;

        const existingDuplicate =
          existing.some(item =>
            areCuriosDuplicate(
              comparable,
              item,
            ),
          );

        if (existingDuplicate) {
          duplicateItems.push({
            hook: validated.hook,
            reason:
              "Matches an existing Curio by hook or concepts.",
          });

          continue;
        }

        const batchDuplicate =
          accepted.some(item =>
            areCuriosDuplicate(
              comparable,
              item as unknown as Record<
                string,
                unknown
              >,
            ),
          );

        if (batchDuplicate) {
          duplicateItems.push({
            hook: validated.hook,
            reason:
              "Duplicates another Curio in this batch.",
          });

          continue;
        }

        accepted.push(validated);
      } catch (error) {
        invalidItems.push({
          index,
          reason:
            error instanceof Error
              ? error.message
              : "Invalid Curio.",
        });
      }
    }

    const batch = db.batch();
    const ids: string[] = [];

    for (const item of accepted) {
      const ref =
        db.collection("content").doc();

      ids.push(ref.id);

      batch.set(ref, {
        ...item,

        feedEligible: false,

        editorial: {
          ...item.editorial,
          status: "draft",
          factChecked: false,
          generatedBy:
            "manual-ai-batch",
        },

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    if (accepted.length) {
      await batch.commit();
    }

    return {
      received: rawItems.length,
      imported: accepted.length,
      duplicates: duplicateItems.length,
      invalid: invalidItems.length,
      duplicateItems,
      invalidItems,
      ids,
    };
  },
);

export const adminUpdateContent = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(request.data);

    if (typeof data.id !== "string" || !data.id.trim()) {
      throw new HttpsError("invalid-argument", "Content id is required.");
    }

    const content = validateContent(data.content);

    await db.collection("content").doc(data.id).update({
      ...content,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true};
  },
);

export const adminDeleteContent = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(request.data);

    if (typeof data.id !== "string" || !data.id.trim()) {
      throw new HttpsError("invalid-argument", "Content id is required.");
    }

    await db.collection("content").doc(data.id).delete();

    return {success: true};
  },
);


export const adminDeleteContentBatch = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(request.data);

    if (
      !Array.isArray(data.ids) ||
      data.ids.length === 0 ||
      data.ids.some(
        id =>
          typeof id !== "string" ||
          !id.trim(),
      )
    ) {
      throw new HttpsError(
        "invalid-argument",
        "ids must be a non-empty array of content IDs.",
      );
    }

    if (data.ids.length > 500) {
      throw new HttpsError(
        "invalid-argument",
        "A maximum of 500 Curios may be deleted at once.",
      );
    }

    const ids = [
      ...new Set(
        data.ids.map(id =>
          String(id).trim(),
        ),
      ),
    ];

    const batch = db.batch();

    for (const id of ids) {
      batch.delete(
        db.collection("content").doc(id),
      );
    }

    await batch.commit();

    return {
      success: true,
      deleted: ids.length,
    };
  },
);

export const adminListInterests = onCall(
  {region: "us-central1", cors: true},
  async (request) => {
    requireAdmin(request.auth?.uid);

    const snapshot = await db.collection("interests").get();

    const items = snapshot.docs
      .map(serializeDocument)
      .sort((a, b) =>
        String(a.title ?? "").localeCompare(String(b.title ?? "")),
      );

    return {items};
  },
);

export const adminCreateInterest = onCall(
  {
    region: "us-central1",
    cors: true,
  },
  async request => {
    requireAdmin(request.auth?.uid);

    const data = request.data as {
      title?: unknown;
      iconUrl?: unknown;
    };

    const title =
      typeof data?.title === "string" ? data.title.trim() : "";

    const iconUrl =
      typeof data?.iconUrl === "string" ? data.iconUrl.trim() : "";

    if (!title) {
      throw new HttpsError(
        "invalid-argument",
        "Interest title is required.",
      );
    }

    const duplicate = await db
      .collection("interests")
      .where("title", "==", title)
      .limit(1)
      .get();

    if (!duplicate.empty) {
      throw new HttpsError(
        "already-exists",
        "An interest with this title already exists.",
      );
    }

    const ref = db.collection("interests").doc();

    const interest: Record<string, unknown> = {
      title,
      enabled: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (iconUrl) {
      interest.iconUrl = iconUrl;
    }

    await ref.set(interest);

    return {
      id: ref.id,
      title,
    };
  },
);

export const adminUpdateInterest = onCall(
  {
    region: "us-central1",
    cors: true,
  },
  async request => {
    requireAdmin(request.auth?.uid);

    const data = request.data as {
      id?: unknown;
      title?: unknown;
      iconUrl?: unknown;
    };

    const id =
      typeof data?.id === "string" ? data.id.trim() : "";

    const title =
      typeof data?.title === "string" ? data.title.trim() : "";

    const iconUrl =
      typeof data?.iconUrl === "string" ? data.iconUrl.trim() : "";

    if (!id) {
      throw new HttpsError(
        "invalid-argument",
        "Interest ID is required.",
      );
    }

    if (!title) {
      throw new HttpsError(
        "invalid-argument",
        "Interest title is required.",
      );
    }

    const ref = db.collection("interests").doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      throw new HttpsError(
        "not-found",
        "Interest not found.",
      );
    }

    const duplicate = await db
      .collection("interests")
      .where("title", "==", title)
      .limit(2)
      .get();

    if (duplicate.docs.some(doc => doc.id !== id)) {
      throw new HttpsError(
        "already-exists",
        "An interest with this title already exists.",
      );
    }

    const update: Record<string, unknown> = {
      title,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (iconUrl) {
      update.iconUrl = iconUrl;
    } else {
      update.iconUrl = admin.firestore.FieldValue.delete();
    }

    await ref.update(update);

    return {
      success: true,
    };
  },
);



type GenerateCurioRequestData = {
  topicId?: unknown;
  topic?: unknown;
  direction?: unknown;
};

export const adminBuildCurioPrompt = onCall(
  async request => {
    requireAdmin(request.auth?.uid);

    const data = requireObject(
      request.data,
      "Prompt request must be an object.",
    );

    const topicId = data.topicId;
    const topic = data.topic;
    const direction = data.direction;

    if (
      typeof topicId !== "string" ||
      !topicId.trim()
    ) {
      throw new HttpsError(
        "invalid-argument",
        '"topicId" is required.',
      );
    }

    if (
      typeof topic !== "string" ||
      !topic.trim()
    ) {
      throw new HttpsError(
        "invalid-argument",
        '"topic" is required.',
      );
    }

    if (
      direction !== undefined &&
      (
        typeof direction !== "string" ||
        !direction.trim()
      )
    ) {
      throw new HttpsError(
        "invalid-argument",
        '"direction" must be a non-empty string.',
      );
    }

    const {
      CurioPromptBuilder,
    } = await import(
      "./application/generation/CurioPromptBuilder"
    );

    const builder =
      new CurioPromptBuilder();

    const prompt = builder.build({
      topicId: topicId.trim(),
      topic: topic.trim(),

      ...(typeof direction === "string"
        ? {
            direction:
              direction.trim(),
          }
        : {}),
    });

    return {
      prompt,
    };
  },
);
