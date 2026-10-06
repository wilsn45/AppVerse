import {Curiosity} from '../../models/Curiosity';
import {imageForCategory} from './categoryImages';


const base = (
  id: string,
  topicId: string,
  topic: string,
  hook: string,
  answer: string,
  explanation: string,
): Curiosity => ({
  id,
  topicId,
  topic,

  hook,
  answer,
  explanation,

  tags: [topicId],
  concepts: [],

  feedEligible: true,

  visual: {
    url: imageForCategory(topicId),
    type: 'photo',
  },

  connections: [],

  sources: [],

  editorial: {
    status: 'published',
    factChecked: false,
  },
});

export const mockCuriosities: Curiosity[] = [
  base('psych-1','psychology','Psychology',
    'Why does embarrassment stay in your head for years?',
    'Your brain gives social mistakes unusually strong memories.',
    'Embarrassing moments combine emotion, self-awareness and fear of social judgment. That makes them easier to remember than ordinary events. We also tend to replay our own mistakes far more than other people do—which is why an awkward moment can feel important years after everyone else forgot it.'),

  base('psych-2','psychology','Psychology',
    'Why do we wake up just before the alarm?',
    'Your body may be keeping time while you sleep.',
    'Your circadian system learns regular wake times. Before your usual waking hour, the body can begin changing hormone levels, temperature and alertness. When your schedule is consistent, that preparation can occasionally wake you shortly before the alarm.'),

  base('space-1','space','Space',
    'What would happen if the Sun suddenly disappeared?',
    'Earth would not notice immediately.',
    'Light and changes in gravity travel at the speed of light. Because the Sun is about eight light-minutes away, Earth would continue receiving sunlight—and continue moving as before—for roughly eight minutes before the change reached us.'),

  base('space-2','space','Space',
    'Could you actually cry in space?',
    'Yes—but the tears behave very differently.',
    'Your eyes can produce tears in microgravity, but the liquid does not fall down your cheeks. Surface tension makes it collect around the eyes instead, forming a growing watery blob until it is wiped away.'),

  base('science-1','science','Science',
    'Why does time seem to move faster as we get older?',
    'The clock is the same. Your experience of it is not.',
    'One explanation involves novelty and memory. Childhood contains many first-time experiences, creating dense memories. Familiar adult routines can produce fewer distinctive memory markers, making long periods feel compressed when we look back on them.'),

  base('science-2','science','Science',
    'Why can hot water sometimes freeze before cold water?',
    'A strange effect scientists still study.',
    'Under some conditions warmer water can freeze sooner than cooler water, a phenomenon associated with the Mpemba effect. Evaporation, convection, dissolved gases and the experimental setup can all influence whether it occurs.'),

  base('money-1','money','Money',
    'Why do prices ending in .99 still work?',
    'Your brain does not process ₹999 exactly like ₹1,000.',
    'People often give disproportionate attention to the leftmost digits of a price. This left-digit effect can make a price just below a round number feel meaningfully cheaper even when the actual difference is tiny.'),

  base('money-2','money','Money',
    'Why does losing ₹1,000 hurt more than gaining ₹1,000 feels good?',
    'Losses can carry more psychological weight than equal gains.',
    'Behavioral research describes this tendency as loss aversion. People often react more strongly to losing something they already possess than to receiving an equivalent gain, which can affect investing, shopping and everyday decisions.'),

  base('world-1','world','World',
    'Why do some countries drive on the left?',
    'The answer stretches back far beyond cars.',
    'Traffic customs developed from older riding and transport traditions and were later standardized by governments and empires. British influence helped spread left-side driving to many regions, while other countries standardized on the right.'),

  base('world-2','world','World',
    'Why are airplane windows rounded?',
    'The shape solved a serious engineering problem.',
    'Early pressurized aircraft revealed that sharp window corners concentrate stress in the fuselage. Rounded windows distribute that stress more smoothly, helping the aircraft tolerate repeated pressurization cycles.'),

  base('animals-1','animals','Animals',
    'Do octopuses really have three hearts?',
    'Yes—and swimming affects how they work.',
    'Octopuses have three hearts. Two pump blood through the gills, while another circulates it through the rest of the body. Their unusual circulatory system is one of many adaptations to life underwater.'),

  base('animals-2','animals','Animals',
    'Why do dogs tilt their heads when we talk?',
    'It may be more than just looking adorable.',
    'Head tilting may help dogs orient toward sounds and process familiar words or cues. Researchers have also observed it during attentive interactions, although there is not one proven explanation for every dog.'),

  base('tech-1','technology','Technology',
    'Why does your phone battery drop faster near 1%?',
    'The percentage is an estimate, not a fuel gauge.',
    'Phones estimate remaining charge using battery voltage, current, temperature and learned behavior. Near the limits of the battery, small estimation errors become more noticeable, so the final percentages may appear to disappear quickly.'),

  base('tech-2','technology','Technology',
    'How does Face ID know a photo is not your face?',
    'It relies on depth, not just a normal picture.',
    'Modern facial authentication systems can combine infrared sensing, depth information and machine-learning models. That gives them information a flat photograph does not contain and helps distinguish a real face from simple image-based attempts.'),

  base('history-1','history','History',
    'Why did ancient Romans use concrete that lasted so long?',
    'Some Roman structures survived for nearly two millennia.',
    'Roman builders used mixtures containing volcanic materials and lime. Research into surviving structures suggests their chemistry and manufacturing techniques could allow cracks to react with water and form new mineral material.'),

  base('history-2','history','History',
    'Was Cleopatra closer to the Moon landing than the pyramids?',
    'The timeline is far stranger than it feels.',
    'The Great Pyramid was built roughly 2,500 years before Cleopatra lived. Cleopatra lived about 2,000 years before the Apollo 11 Moon landing, placing her chronologically closer to the Moon landing than to the construction of the Great Pyramid.'),

  base('ent-1','entertainment','Entertainment',
    'Why do movie trailers sometimes reveal so much?',
    'Studios are optimizing for the decision to buy a ticket.',
    'Trailers are marketing products rather than miniature versions of the film. Research screenings and campaign strategy can favor showing recognizable stars, major set pieces and clear story stakes when those elements make audiences more interested.'),

  base('ent-2','entertainment','Entertainment',
    'Why does recorded laughter change how a joke feels?',
    'Other people laughing can influence your own response.',
    'Humans use social information when interpreting situations. Hearing laughter can signal that something is playful or funny and can increase the likelihood that an audience responds similarly.'),

  base('internet-1','internet','Internet',
    'Why can one random video suddenly become viral?',
    'Virality often begins with small feedback loops.',
    'Recommendation systems test content with audiences and observe signals such as viewing, sharing and engagement. Strong early responses can expose a post to progressively larger groups, sometimes creating rapid exponential distribution.'),

  base('internet-2','internet','Internet',
    'Why is doomscrolling so difficult to stop?',
    'Uncertainty can keep your brain asking for one more update.',
    'Feeds combine novelty, uncertain rewards and an effectively endless supply of information. When the topic also feels threatening or important, the urge to reduce uncertainty can keep people checking even when the experience is unpleasant.'),

  base('story-1','stories','Stories',
    'Why do unfinished stories stay stuck in our minds?',
    'Your brain dislikes leaving a loop open.',
    'Unfinished or interrupted activities can remain mentally accessible because the goal has not been resolved. This idea is often associated with the Zeigarnik effect and helps explain why cliffhangers can be so effective.'),

  base('story-2','stories','Stories',
    'Why do plot twists feel satisfying when they work?',
    'The best twists surprise you and still make sense afterward.',
    'A strong twist forces the audience to reinterpret earlier information. It creates surprise while allowing previous clues to acquire a new meaning, giving the brain both novelty and a satisfying feeling of coherence.'),

  base('beautiful-1','beautiful-things','Beautiful Things',
    'Why does the sky sometimes turn intensely pink?',
    'Sunlight is taking a much longer path through the atmosphere.',
    'Near sunrise and sunset, sunlight travels through more atmosphere. Shorter blue wavelengths are scattered away more strongly, allowing reds, oranges and pinks to dominate the light that reaches your eyes.'),

  base('beautiful-2','beautiful-things','Beautiful Things',
    'What makes bioluminescent beaches glow blue?',
    'Tiny organisms can turn movement into light.',
    'Some marine microorganisms produce light through chemical reactions. Waves, footsteps or other disturbances can trigger flashes, creating the appearance of glowing blue water along certain coastlines.'),

  base('weird-1','weird-stuff','Weird Stuff',
    'Why can you not tickle yourself properly?',
    'Your brain predicts your own touch too well.',
    'When you create a movement yourself, the brain predicts many of its sensory consequences. That prediction reduces the surprise of the sensation, making self-produced tickling much less effective than unexpected touch.'),

  base('weird-2','weird-stuff','Weird Stuff',
    'Why does your own voice sound wrong in recordings?',
    'You normally hear yourself through two different paths.',
    'When you speak, you hear sound through the air and vibrations conducted through your skull. A recording mainly reproduces the air-conducted component, so it sounds thinner or simply unfamiliar compared with the voice inside your head.'),

  base('blow-1','blow-my-mind','Blow My Mind',
    'A day on Venus is longer than its year. How?',
    'Venus rotates unbelievably slowly.',
    'Venus takes about 243 Earth days to rotate once relative to distant stars, while it completes an orbit around the Sun in about 225 Earth days. Its unusual slow, retrograde rotation makes its calendar deeply unintuitive.'),

  base('blow-2','blow-my-mind','Blow My Mind',
    'You have probably never touched anything in the way you imagine.',
    'At atomic scales, “touching” becomes complicated.',
    'When objects meet, electromagnetic interactions between their atoms resist further overlap. The everyday sensation we call touch emerges from those forces rather than tiny solid surfaces simply passing into one another.'),

  base('happening-1','whats-happening',"What's Happening",
    'Why can a trend appear everywhere almost overnight?',
    'Networks can make adoption look suddenly explosive.',
    'Trends often spread through overlapping social networks. Once enough connected communities begin sharing the same thing, repeated exposure and recommendation systems can make growth appear almost instantaneous.'),

  base('happening-2','whats-happening',"What's Happening",
    'Why do we suddenly notice something everywhere after learning about it?',
    'The world may not have changed—your attention did.',
    'After something becomes meaningful to you, your attention is more likely to notice it. This frequency illusion can create the impression that a newly learned word, product or idea has suddenly become much more common.'),

  base('sleep-1','psychology','Psychology',
    'Why do dreams disappear minutes after waking?',
    'Dream memories can be surprisingly fragile.',
    'Memory formation works differently during sleep. After waking, incoming thoughts and sensory information quickly compete with the fragile memory of a dream, so much of it can disappear unless you deliberately recall it.'),

  base('sleep-2','psychology','Psychology',
    'What actually causes sleep paralysis?',
    'Your mind can wake before your body exits REM sleep.',
    'During REM sleep, the brain suppresses movement in many voluntary muscles. Sleep paralysis can occur when awareness returns before that temporary muscle inhibition has fully ended, leaving you awake but briefly unable to move.'),
];



/**
 * Curiosity graph
 *
 * Related links are intentionally authored.
 *
 * Rule:
 * Parent question -> immediate follow-up questions
 * -> deeper questions -> narrower questions.
 *
 * We NEVER generate related links by category alone.
 */
const curiosityGraph: Record<
  string,
  string[]
> = {
  // --------------------------------------------------
  // SLEEP
  // --------------------------------------------------

  'psych-2': [
    'sleep-1',
    'sleep-2',
  ],

  'sleep-1': [
    'dream-real',
    'dream-memory',
  ],

  'sleep-2': [
    'sleep-hallucination',
    'rem-paralysis',
  ],

  // --------------------------------------------------
  // SPACE
  // --------------------------------------------------

  'space-1': [
    'sun-gravity',
    'sun-eight-minutes',
  ],

  'space-2': [
    'space-tears',
    'space-body',
  ],

  // --------------------------------------------------
  // INTERNET
  // --------------------------------------------------

  'internet-1': [
    'viral-first-hour',
    'viral-algorithm',
  ],

  'internet-2': [
    'doom-uncertainty',
    'doom-reward',
  ],

  // --------------------------------------------------
  // HISTORY
  // --------------------------------------------------

  'history-1': [
    'roman-concrete-1',
    'roman-concrete-2',
  ],

  'history-2': [
    'cleopatra-timeline',
    'pyramid-timeline',
  ],
};


// ======================================================
// DEEP FOLLOW-UP CONTENT
// ======================================================

mockCuriosities.push(
  {
    id: 'dream-real',
    topicId: 'psychology',
    topic: 'Psychology',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why can dreams feel completely real while they are happening?',

    answer:
      'The dreaming brain does not question reality the same way your waking brain does.',

    explanation:
      'During vivid dreaming, brain regions involved in imagery and emotion can be highly active, while some regions involved in critical reasoning behave differently. Because the brain is generating both the experience and your interpretation of it, bizarre events can temporarily feel completely normal.',

    visual: {
      url:
      imageForCategory('psychology'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'dream-memory',
    topicId: 'psychology',
    topic: 'Psychology',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why are some dreams remembered for years while most disappear?',

    answer:
      'Emotion and the moment you wake up can change whether a dream survives.',

    explanation:
      'Dreams are more likely to be remembered when you wake during or shortly after them, especially when they contain strong emotion. Rehearsing the dream immediately after waking can also strengthen a memory that would otherwise fade quickly.',

    visual: {
      url:
      imageForCategory('psychology'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'sleep-hallucination',
    topicId: 'psychology',
    topic: 'Psychology',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why do people sometimes see a person in the room during sleep paralysis?',

    answer:
      'Dream imagery can overlap with the real bedroom around you.',

    explanation:
      'Sleep paralysis can occur while features of REM dreaming are still active. Your eyes may be open and your room may be visible, while dream-like imagery and threat-processing systems remain active. The result can feel like a real person or presence is standing nearby.',

    visual: {
      url:
      imageForCategory('psychology'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'rem-paralysis',
    topicId: 'psychology',
    topic: 'Psychology',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why does the brain temporarily paralyze the body during REM sleep?',

    answer:
      'It may prevent your body from physically acting out most dreams.',

    explanation:
      'During REM sleep, brainstem systems strongly reduce activity in many voluntary muscles. This temporary muscle atonia helps separate vivid dream activity from physical movement. Sleep paralysis occurs when awareness returns before this process has fully ended.',

    visual: {
      url:
      imageForCategory('psychology'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'sun-gravity',
    topicId: 'space',
    topic: 'Space',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Would Earth instantly fly away if the Sun disappeared?',

    answer:
      'Even gravity cannot communicate a change instantaneously.',

    explanation:
      'Changes in gravity propagate at the speed of light. If the Sun could somehow vanish, Earth would continue following its previous orbit for roughly eight minutes. After the gravitational change reached us, Earth would continue moving approximately along the tangent to its former orbit.',

    visual: {
      url:
      imageForCategory('space'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'sun-eight-minutes',
    topicId: 'space',
    topic: 'Space',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why does sunlight take about eight minutes to reach Earth?',

    answer:
      'Even the fastest thing in the universe needs time to cross space.',

    explanation:
      'Earth is roughly 150 million kilometres from the Sun. Light travels at about 300,000 kilometres per second, so sunlight needs a little over eight minutes to cross that distance. Every view of the Sun is therefore a view of how it looked minutes earlier.',

    visual: {
      url:
      imageForCategory('space'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'space-tears',
    topicId: 'space',
    topic: 'Space',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Where do your tears go when there is almost no gravity?',

    answer:
      'They do not roll down your cheeks.',

    explanation:
      'Surface tension causes tears to cling around the eye instead of falling downward. As more liquid accumulates, it can form an uncomfortable blob around the eye until the astronaut wipes it away.',

    visual: {
      url:
      imageForCategory('space'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'space-body',
    topicId: 'space',
    topic: 'Space',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why do astronauts become slightly taller in space?',

    answer:
      'Without normal gravity, the spine can expand.',

    explanation:
      'On Earth, gravity compresses the spine throughout the day. In microgravity that compression is greatly reduced, allowing the discs between vertebrae to expand. Astronauts can temporarily become a few centimetres taller before returning toward normal after coming home.',

    visual: {
      url:
      imageForCategory('space'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'viral-first-hour',
    topicId: 'internet',
    topic: 'Internet',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why can the first hour matter so much for a viral post?',

    answer:
      'Early audience reactions can determine how widely a system tests the content.',

    explanation:
      'Recommendation systems can initially expose content to a limited audience and observe signals such as watch time, completion, sharing and interaction. Strong responses can lead to wider distribution, creating a feedback loop that rapidly expands reach.',

    visual: {
      url:
      imageForCategory('internet'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'viral-algorithm',
    topicId: 'internet',
    topic: 'Internet',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Does an algorithm actually decide that something should go viral?',

    answer:
      'Usually there is no single “make this viral” decision.',

    explanation:
      'Large recommendation systems continually rank content for individual users. If a piece repeatedly performs well with different audiences, those ranking decisions can compound. What looks like one giant viral decision can instead emerge from millions of smaller recommendations.',

    visual: {
      url:
      imageForCategory('internet'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'doom-uncertainty',
    topicId: 'internet',
    topic: 'Internet',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why does bad news make you want to check for even more bad news?',

    answer:
      'Your brain may be trying to reduce uncertainty.',

    explanation:
      'Threatening information can make uncertainty feel especially uncomfortable. Checking for another update can briefly feel like taking control or gathering useful information, even when the next update increases anxiety and starts the cycle again.',

    visual: {
      url:
      imageForCategory('internet'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'doom-reward',
    topicId: 'internet',
    topic: 'Internet',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Why is “just one more scroll” so powerful?',

    answer:
      'The next item is unpredictable—and that uncertainty keeps attention engaged.',

    explanation:
      'Each swipe carries uncertainty about what appears next. Interesting, surprising and emotionally intense items arrive unpredictably. This variable pattern can encourage continued checking because the next swipe might contain something especially rewarding or important.',

    visual: {
      url:
      imageForCategory('internet'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'roman-concrete-1',
    topicId: 'history',
    topic: 'History',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'What was actually inside Roman concrete?',

    answer:
      'Volcanic material and lime gave it unusual chemistry.',

    explanation:
      'Roman builders commonly combined lime with volcanic ash or other reactive materials. These ingredients could form durable mineral structures over time, helping explain why some Roman concrete has survived in harsh environments for centuries.',

    visual: {
      url:
      imageForCategory('history'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'roman-concrete-2',
    topicId: 'history',
    topic: 'History',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'Could Roman concrete actually repair its own cracks?',

    answer:
      'Certain lime-rich fragments may react when water enters a crack.',

    explanation:
      'Research suggests that some Roman concrete contains lime-rich inclusions created by its manufacturing process. When cracks expose these materials to water, chemical reactions can produce minerals that fill parts of the crack, potentially extending the structure’s lifetime.',

    visual: {
      url:
      imageForCategory('history'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'cleopatra-timeline',
    topicId: 'history',
    topic: 'History',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'How old were the pyramids when Cleopatra was alive?',

    answer:
      'To Cleopatra, the Great Pyramid was already extremely ancient.',

    explanation:
      'The Great Pyramid of Giza was built around the 26th century BCE. Cleopatra VII lived during the first century BCE. That means the pyramid was already roughly two and a half millennia old during her lifetime.',

    visual: {
      url:
      imageForCategory('history'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },

  {
    id: 'pyramid-timeline',
    topicId: 'history',
    topic: 'History',

    tags: [],
    concepts: [],

    sources: [],

    editorial: {
      status: 'published',
      factChecked: false,
    },

    hook:
      'What other famous civilizations appeared after the pyramids were already ancient?',

    answer:
      'The pyramids sit astonishingly early in recorded history.',

    explanation:
      'The Great Pyramid was already ancient before many events and civilizations commonly associated with the classical world. Compressing thousands of years into the label “ancient history” can make these enormous chronological distances easy to miss.',

    visual: {
      url:
      imageForCategory('history'),
      type: 'photo',
    },

    feedEligible: true,

    connections: [],
  },
);


// Apply explicitly authored relationships.
//
// These are graph edges rather than parent/child hierarchy.
// Every Curio remains independently usable.
mockCuriosities.forEach(item => {
  const related =
    curiosityGraph[item.id] ?? [];

  item.connections =
    related.map(curiosityId => ({
      curiosityId,
      relationship: 'deeper',
    }));

  item.tags =
    item.tags ?? [item.topicId];

  item.concepts =
    item.concepts ?? [];

  item.feedEligible = true;

  item.sources =
    item.sources ?? [];

  item.editorial =
    item.editorial ?? {
      status: 'published',
      factChecked: false,
    };
});
