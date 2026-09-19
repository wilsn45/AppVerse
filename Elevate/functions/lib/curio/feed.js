"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurioFeedHandler = exports.mixFeed = void 0;
const admin = __importStar(require("firebase-admin"));
const stringArray = (value, max) => Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, max) : [];
const asIsoString = (value) => {
    if (value instanceof admin.firestore.Timestamp)
        return value.toDate().toISOString();
    return typeof value === "string" ? value : undefined;
};
const normalize = (document) => {
    const data = document.data();
    if (typeof data.topic !== "string" || typeof data.hook !== "string" || typeof data.format !== "string")
        return null;
    return Object.assign(Object.assign({}, data), { id: document.id, topic: data.topic, tags: stringArray(data.tags, 30), format: data.format, origin: data.origin === "trending" ? "trending" : "evergreen", hook: data.hook, status: "published", publishedAt: asIsoString(data.publishedAt), expiresAt: asIsoString(data.expiresAt) });
};
const mixFeed = (candidates, interests, seenIds, limit) => {
    const seen = new Set(seenIds);
    const preferred = new Set(interests);
    const now = Date.now();
    const score = (item) => { var _a; return ((_a = item.qualityScore) !== null && _a !== void 0 ? _a : 50) + (preferred.has(item.topic) ? 24 : 5) + Math.random() * 22; };
    const pool = candidates
        .filter((item) => !seen.has(item.id) && (item.origin !== "trending" || !item.expiresAt || new Date(item.expiresAt).getTime() > now))
        .sort((a, b) => score(b) - score(a));
    const result = [];
    while (pool.length && result.length < limit) {
        const previous = result[result.length - 1];
        const differentTopic = previous ? pool.findIndex((item) => item.topic !== previous.topic) : 0;
        result.push(pool.splice(differentTopic >= 0 ? differentTopic : 0, 1)[0]);
    }
    return result;
};
exports.mixFeed = mixFeed;
const getCurioFeedHandler = async (request) => {
    var _a, _b, _c;
    const interests = stringArray((_a = request.data) === null || _a === void 0 ? void 0 : _a.interests, 30);
    const seenContentIds = stringArray((_b = request.data) === null || _b === void 0 ? void 0 : _b.seenContentIds, 500);
    const requestedLimit = typeof ((_c = request.data) === null || _c === void 0 ? void 0 : _c.limit) === "number" ? request.data.limit : 30;
    const limit = Math.max(1, Math.min(Math.floor(requestedLimit), 50));
    const snapshot = await admin.firestore().collection("content").where("status", "==", "published").limit(250).get();
    const candidates = snapshot.docs.map(normalize).filter((item) => item !== null);
    return { items: (0, exports.mixFeed)(candidates, interests, seenContentIds, limit), cursor: `${Date.now()}` };
};
exports.getCurioFeedHandler = getCurioFeedHandler;
//# sourceMappingURL=feed.js.map