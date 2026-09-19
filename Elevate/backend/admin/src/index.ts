import * as admin from "firebase-admin";
import {HttpsError, onCall} from "firebase-functions/v2/https";

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
): Record<string, unknown> => {
  const item = requireObject(value, "Each content item must be an object.");

  if (
    typeof item.interestTitle !== "string" ||
    !item.interestTitle.trim()
  ) {
    throw new HttpsError(
      "invalid-argument",
      'Content requires "interestTitle".',
    );
  }

  if (typeof item.format !== "string" || !item.format.trim()) {
    throw new HttpsError("invalid-argument", 'Content requires "format".');
  }

  if (typeof item.hook !== "string" || !item.hook.trim()) {
    throw new HttpsError("invalid-argument", 'Content requires "hook".');
  }

  if (
    item.status !== "draft" &&
    item.status !== "published" &&
    item.status !== "archived"
  ) {
    throw new HttpsError(
      "invalid-argument",
      'Content status must be "draft", "published", or "archived".',
    );
  }

  return item;
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

