# Curio

Curio is a visual, swipe-based feed of interesting things. The V1 React Native app has two experiences: a skippable local interest picker and a vertically paged content feed. It does not require an account.

## Run the app

Requirements: Node 18+, the React Native Android/iOS toolchain, and the Firebase configuration files already present in the native projects.

```bash
npm install
npm start
npm run android # or: npm run ios
```

The app calls the `getCurioFeed` Firebase callable function. If the function is unavailable or the collection is empty, a small starter feed is used so local development remains usable.

## Content

Published cards live in the Firestore `content` collection. A minimal document looks like:

```json
{
  "topic": "space",
  "tags": ["mars", "light"],
  "format": "visualFact",
  "origin": "evergreen",
  "hook": "Sunsets on Mars are BLUE.",
  "body": "Fine Martian dust scatters blue light around the Sun.",
  "visual": {"type": "image", "url": "https://..."},
  "status": "published",
  "qualityScore": 95
}
```

Trending items can include `publishedAt`, `expiresAt`, `sourceNames`, and `sourceUrls`. Expired trending items and anything not marked `published` are excluded by the feed function. Direct client access to Firestore is denied; the app receives structured content through the function.

## Backend

```bash
cd functions
npm ci
npm run build
npm run lint
firebase deploy --only functions:getCurioFeed,firestore:rules
```

The function accepts local interests, seen content IDs, and a batch limit. It filters, scores, mixes topics, removes immediate repeats, and returns up to 50 items.

## Checks

```bash
npx tsc -p tsconfig.curio.json
npx eslint App.tsx 'src/**/*.{ts,tsx}' --no-cache
npm test -- --runInBand
cd functions && npm run build && npm run lint
cd android && ./gradlew assembleDebug
```

`tsconfig.curio.json` intentionally targets the new product surface. Retained legacy course/task files have pre-existing type errors and are no longer reachable from the Curio app entry point.
