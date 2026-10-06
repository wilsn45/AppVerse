import * as admin from "firebase-admin";
import {CallableRequest} from "firebase-functions/v2/https";
import type {Curiosity} from "@curio/shared";

interface FeedRequestData {
  interests?: unknown;
  seenContentIds?: unknown;
  limit?: unknown;
  cursor?: unknown;
}


const stringArray = (
  value: unknown,
  max: number,
): string[] =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .slice(0, max)
    : [];

const normalize = (
  document: admin.firestore.QueryDocumentSnapshot,
): Curiosity | null => {
  const data = document.data();

  if (
    typeof data.hook !== "string" ||
    typeof data.answer !== "string" ||
    typeof data.explanation !== "string" ||
    typeof data.topicId !== "string" ||
    typeof data.topic !== "string" ||
    typeof data.feedEligible !== "boolean" ||
    !data.visual ||
    typeof data.visual !== "object" ||
    !data.editorial ||
    typeof data.editorial !== "object"
  ) {
    return null;
  }

  if (
    data.editorial.status !== "published" ||
    data.editorial.factChecked !== true ||
    data.feedEligible !== true
  ) {
    return null;
  }

  return {
    ...data,

    id: document.id,

    hook: data.hook,
    answer: data.answer,
    explanation: data.explanation,

    topicId: data.topicId,
    topic: data.topic,

    tags: stringArray(data.tags, 30),
    concepts: stringArray(data.concepts, 30),

    feedEligible: true,

    visual: data.visual as Curiosity["visual"],

    explore: Array.isArray(data.explore)
      ? data.explore
      : [],

    sources: Array.isArray(data.sources)
      ? data.sources
      : [],

    editorial:
      data.editorial as Curiosity["editorial"],
  };
};

export const mixFeed = (
  candidates: Curiosity[],
  interests: string[],
  seenIds: string[],
  limit: number,
): Curiosity[] => {
  const seen = new Set(seenIds);

  const preferred = new Set(
    interests.map(value => value.toLowerCase()),
  );

  const score = (
    item: Curiosity,
  ): number => {
    const quality =
      item.editorial.qualityScore ?? 50;

    const matchesInterest =
      preferred.has(item.topicId.toLowerCase()) ||
      preferred.has(item.topic.toLowerCase());

    /*
     * Keep discovery in the feed.
     *
     * Selected interests receive a meaningful boost,
     * but Curio should still expose users to surprising
     * things outside their existing interests.
     */
    const interestBoost =
      matchesInterest ? 24 : 5;

    const discoveryNoise =
      Math.random() * 22;

    return (
      quality +
      interestBoost +
      discoveryNoise
    );
  };

  const pool = candidates
    .filter(item => !seen.has(item.id))
    .sort((a, b) => score(b) - score(a));

  const result: Curiosity[] = [];

  while (
    pool.length &&
    result.length < limit
  ) {
    const previous =
      result[result.length - 1];

    const differentTopicIndex =
      previous
        ? pool.findIndex(
            item =>
              item.topicId !==
              previous.topicId,
          )
        : 0;

    const index =
      differentTopicIndex >= 0
        ? differentTopicIndex
        : 0;

    result.push(
      pool.splice(index, 1)[0],
    );
  }

  return result;
};

export const getCurioFeedHandler = async (
  request: CallableRequest<FeedRequestData>,
) => {
  const interests = stringArray(
    request.data?.interests,
    30,
  );

  const seenContentIds = stringArray(
    request.data?.seenContentIds,
    500,
  );

  const requestedLimit =
    typeof request.data?.limit === "number"
      ? request.data.limit
      : 30;

  const limit = Math.max(
    1,
    Math.min(
      Math.floor(requestedLimit),
      50,
    ),
  );

  /*
   * We intentionally query only feedEligible here.
   *
   * Firestore cannot conveniently query nested editorial
   * state plus all of our validation requirements without
   * coupling the API too tightly to indexes.
   *
   * normalize() performs the final publishing gate.
   */
  const snapshot = await admin
    .firestore()
    .collection("content")
    .where("feedEligible", "==", true)
    .limit(250)
    .get();

  const candidates = snapshot.docs
    .map(normalize)
    .filter(
      (item): item is Curiosity =>
        item !== null,
    );

  return {
    items: mixFeed(
      candidates,
      interests,
      seenContentIds,
      limit,
    ),
    cursor: `${Date.now()}`,
  };
};
