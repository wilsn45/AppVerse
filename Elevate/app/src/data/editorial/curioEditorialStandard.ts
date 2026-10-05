/**
 * CURIO EDITORIAL STANDARD
 *
 * Curio is not a random-fact app.
 *
 * Every Curio should satisfy a genuine curiosity quickly,
 * while giving the user the option to understand it more
 * deeply or continue into related curiosities.
 *
 * Core experience:
 *
 *   HOOK
 *      ↓
 *   DIRECT ANSWER
 *      ↓
 *   swipe OR explore
 *      ↓
 *   deeper explanation
 *      ↓
 *   connected curiosities
 */

/**
 * ---------------------------------------------------------
 * HOOK
 * ---------------------------------------------------------
 *
 * A hook creates a genuine curiosity gap.
 *
 * GOOD:
 * "Why can't you tickle yourself?"
 *
 * GOOD:
 * "What would happen if the Sun suddenly disappeared?"
 *
 * GOOD:
 * "Why does your own voice sound strange in recordings?"
 *
 * BAD:
 * "Here are 5 interesting facts about your brain."
 *
 * BAD:
 * "You won't believe this amazing fact."
 *
 * BAD:
 * "Did you know octopuses have three hearts?"
 *
 * Rules:
 *
 * - Prefer questions people naturally want answered.
 * - Avoid generic "Did you know?" trivia.
 * - Avoid clickbait.
 * - Avoid exaggeration.
 * - Avoid manufacturing mystery when the subject itself
 *   is already interesting.
 */
export const HOOK_RULES = {
  preferredMaxCharacters: 90,
};

/**
 * ---------------------------------------------------------
 * ANSWER
 * ---------------------------------------------------------
 *
 * The answer is shown DIRECTLY IN THE FEED.
 *
 * It must resolve the fundamental question.
 *
 * The user must NEVER be forced to open the Curio just
 * to discover the answer.
 *
 * GOOD
 *
 * Hook:
 * "Why are airplane windows rounded?"
 *
 * Answer:
 * "Rounded corners spread pressure stress more evenly.
 * Sharp corners concentrate it, which made early
 * pressurized aircraft more vulnerable to metal fatigue."
 *
 *
 * BAD
 *
 * "The shape solved a serious engineering problem."
 *
 * That is a teaser, not an answer.
 *
 *
 * GOOD
 *
 * Hook:
 * "Could you actually cry in space?"
 *
 * Answer:
 * "Yes. But without gravity pulling tears down your
 * cheeks, surface tension makes them collect around
 * your eyes instead."
 *
 *
 * DIRECT ANSWER TEST
 *
 * Ask:
 *
 * "If the user reads only the hook and answer,
 * have we actually answered the question?"
 *
 * If NO:
 * regenerate the answer.
 */
export const ANSWER_RULES = {
  preferredMinCharacters: 60,
  preferredMaxCharacters: 220,
  preferredSentences: '1-3',
};

/**
 * ---------------------------------------------------------
 * EXPLANATION
 * ---------------------------------------------------------
 *
 * Opening a Curio is NOT how the user gets the answer.
 *
 * Opening means:
 *
 * "That was interesting. Help me understand it better."
 *
 * Explanation should:
 *
 * - explain the mechanism
 * - add useful context
 * - preserve nuance
 * - mention uncertainty where appropriate
 * - avoid repeating the answer word-for-word
 *
 * It should still feel lightweight.
 */
export const EXPLANATION_RULES = {
  preferredMinWords: 45,
  preferredMaxWords: 140,
};

/**
 * ---------------------------------------------------------
 * QUICK FACT
 * ---------------------------------------------------------
 *
 * Optional.
 *
 * A particularly memorable extra detail.
 *
 * It should NOT exist merely because the schema supports it.
 *
 * Example:
 *
 * "Astronauts can temporarily become several centimetres
 * taller in microgravity."
 */
export const QUICK_FACT_RULES = {
  optional: true,
};

/**
 * ---------------------------------------------------------
 * TOPICS / TAGS / CONCEPTS
 * ---------------------------------------------------------
 *
 * topic:
 * Broad user-facing interest.
 *
 * Example:
 * Psychology
 *
 * tags:
 * Useful descriptive labels.
 *
 * Example:
 * ["memory", "emotion", "social-behaviour"]
 *
 * concepts:
 * Canonical semantic ideas represented by the Curio.
 *
 * Example:
 * [
 *   "embarrassing memory",
 *   "emotional memory",
 *   "social evaluation"
 * ]
 *
 * Concepts are especially important for:
 *
 * - personalization
 * - duplicate detection
 * - recommendation
 * - graph construction
 */
export const CLASSIFICATION_RULES = {
  preferredTags: '2-5',
  preferredConcepts: '2-5',
};

/**
 * ---------------------------------------------------------
 * CONNECTIONS
 * ---------------------------------------------------------
 *
 * Curio is a GRAPH, not a strict content tree.
 *
 * A Curio can connect to another through:
 *
 * deeper
 * why
 * how
 * related
 * surprising
 *
 * Connections should be semantic.
 *
 * NEVER connect content simply because it shares a category.
 *
 * Example:
 *
 * "Why do dreams disappear after waking?"
 *
 * can connect to:
 *
 * "Why can dreams feel completely real?"
 *
 * but should NOT automatically connect to:
 *
 * "Why do people fear public speaking?"
 *
 * merely because both are Psychology.
 *
 * A Curio does NOT require connections to be publishable.
 */
export const CONNECTION_RULES = {
  preferredConnections: '0-4',
};

/**
 * ---------------------------------------------------------
 * DUPLICATE PREVENTION
 * ---------------------------------------------------------
 *
 * Rewording an existing Curio does NOT create a new Curio.
 *
 * Example:
 *
 * Existing:
 * "Why can't you tickle yourself?"
 *
 * Candidate:
 * "Why does tickling only work when somebody else does it?"
 *
 * These probably represent the SAME fundamental curiosity.
 *
 *
 * Duplicate detection pipeline:
 *
 * 1. normalize candidate
 * 2. identify canonical concepts
 * 3. create embedding
 * 4. vector search existing library
 * 5. inspect nearest candidates
 * 6. semantic duplicate judgment
 *
 * Result:
 *
 * UNIQUE
 * DUPLICATE
 * OVERLAPPING_BUT_DISTINCT
 *
 * DUPLICATE → reject.
 *
 * OVERLAPPING_BUT_DISTINCT → candidate must provide
 * meaningfully different knowledge.
 */
export const DUPLICATE_RULES = {
  enabled: true,
};

/**
 * ---------------------------------------------------------
 * SOURCES
 * ---------------------------------------------------------
 *
 * Production factual Curios require evidence.
 *
 * AI memory alone is not considered a source.
 *
 * Prefer:
 *
 * - primary sources
 * - scientific institutions
 * - universities
 * - government/space/science agencies
 * - peer-reviewed research
 * - respected secondary references
 *
 * Claims should not become stronger than their sources.
 */
export const SOURCE_RULES = {
  productionSourcesRequired: true,
  preferredMinimumSources: 2,
};

/**
 * ---------------------------------------------------------
 * VISUALS
 * ---------------------------------------------------------
 *
 * The visual should help communicate the curiosity.
 *
 * The agent first chooses a visual strategy:
 *
 * photo
 * generated
 * illustration
 * diagram
 * archival
 * map
 * portrait
 *
 * Prefer authentic imagery where authenticity matters.
 *
 * Generate imagery when a conceptual/reconstructed visual
 * communicates the idea better.
 *
 * Never generate a fake documentary-looking image and
 * present it as a real photograph of an event.
 */
export const VISUAL_RULES = {
  strategyRequired: true,
};

/**
 * ---------------------------------------------------------
 * CURIO QUALITY GATE
 * ---------------------------------------------------------
 *
 * Before publication every generated Curio must pass:
 *
 * 1. Is the hook genuinely interesting?
 *
 * 2. Does the answer directly answer the hook?
 *
 * 3. Is the explanation meaningfully deeper?
 *
 * 4. Is it factually supported?
 *
 * 5. Is it sufficiently different from existing Curios?
 *
 * 6. Are topic/tags/concepts accurate?
 *
 * 7. Does the visual fit the content?
 *
 * 8. Would somebody plausibly stop scrolling for this?
 *
 * A failure should normally trigger regeneration/revision,
 * not publication.
 */
export const QUALITY_GATE = {
  required: true,
};
