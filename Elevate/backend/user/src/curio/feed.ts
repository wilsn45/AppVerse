import * as admin from "firebase-admin";
import {CallableRequest} from "firebase-functions/v2/https";

interface FeedRequestData { interests?: unknown; seenContentIds?: unknown; limit?: unknown; cursor?: unknown; }
interface ContentItem {
  id: string; topic: string; tags: string[]; format: string;
  origin: "evergreen" | "trending"; hook: string; expiresAt?: string;
  status: "published"; qualityScore?: number; [key: string]: unknown;
}

const stringArray = (value: unknown, max: number): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, max) : [];

const asIsoString = (value: unknown): string | undefined => {
  if (value instanceof admin.firestore.Timestamp) return value.toDate().toISOString();
  return typeof value === "string" ? value : undefined;
};

const normalize = (document: admin.firestore.QueryDocumentSnapshot): ContentItem | null => {
  const data = document.data();
  if (typeof data.topic !== "string" || typeof data.hook !== "string" || typeof data.format !== "string") return null;
  return {
    ...data, id: document.id, topic: data.topic, tags: stringArray(data.tags, 30),
    format: data.format, origin: data.origin === "trending" ? "trending" : "evergreen",
    hook: data.hook, status: "published", publishedAt: asIsoString(data.publishedAt),
    expiresAt: asIsoString(data.expiresAt),
  } as ContentItem;
};

export const mixFeed = (candidates: ContentItem[], interests: string[], seenIds: string[], limit: number): ContentItem[] => {
  const seen = new Set(seenIds);
  const preferred = new Set(interests);
  const now = Date.now();
  const score = (item: ContentItem) => (item.qualityScore ?? 50) + (preferred.has(item.topic) ? 24 : 5) + Math.random() * 22;
  const pool = candidates
    .filter((item) => !seen.has(item.id) && (item.origin !== "trending" || !item.expiresAt || new Date(item.expiresAt).getTime() > now))
    .sort((a, b) => score(b) - score(a));
  const result: ContentItem[] = [];
  while (pool.length && result.length < limit) {
    const previous = result[result.length - 1];
    const differentTopic = previous ? pool.findIndex((item) => item.topic !== previous.topic) : 0;
    result.push(pool.splice(differentTopic >= 0 ? differentTopic : 0, 1)[0]);
  }
  return result;
};

export const getCurioFeedHandler = async (request: CallableRequest<FeedRequestData>) => {
  const interests = stringArray(request.data?.interests, 30);
  const seenContentIds = stringArray(request.data?.seenContentIds, 500);
  const requestedLimit = typeof request.data?.limit === "number" ? request.data.limit : 30;
  const limit = Math.max(1, Math.min(Math.floor(requestedLimit), 50));
  const snapshot = await admin.firestore().collection("content").where("status", "==", "published").limit(250).get();
  const candidates = snapshot.docs.map(normalize).filter((item): item is ContentItem => item !== null);
  return {items: mixFeed(candidates, interests, seenContentIds, limit), cursor: `${Date.now()}`};
};
