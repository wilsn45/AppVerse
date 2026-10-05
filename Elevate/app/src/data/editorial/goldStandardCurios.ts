import {Curiosity} from '../../models/Curiosity';

/**
 * GOLD STANDARD CURIOS
 *
 * These examples define the editorial quality we expect
 * from Curio's AI generation pipeline.
 *
 * They are NOT automatically part of the user's feed.
 *
 * Future AI-generated content should be evaluated against
 * these examples for:
 *
 * - hook quality
 * - direct-answer quality
 * - explanation depth
 * - classification quality
 * - Curio tone
 */

export const goldStandardCurios: Curiosity[] = [
  {
    id: 'gold-airplane-windows',

    hook:
      'Why are airplane windows rounded?',

    answer:
      'Rounded corners spread pressure stress more evenly. Sharp corners concentrate stress, which made early pressurized aircraft more vulnerable to metal fatigue and cracking.',

    explanation:
      'An airliner repeatedly expands and contracts slightly as the cabin is pressurized and depressurized. Sharp corners create stress concentrations where those forces become much stronger. Early jet-airliner failures helped engineers understand how dangerous this could be. Rounded windows distribute the load more smoothly through the fuselage, reducing those concentrated weak points.',

    quickFact:
      'The shape of modern aircraft windows is partly the result of lessons learned from early pressurized jet aircraft.',

    topicId: 'technology',
    topic: 'Technology',

    tags: [
      'aviation',
      'engineering',
      'aircraft',
    ],

    concepts: [
      'aircraft windows',
      'stress concentration',
      'cabin pressurization',
      'metal fatigue',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'photo',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-self-tickle',

    hook:
      "Why can't you properly tickle yourself?",

    answer:
      'Your brain predicts the sensation created by your own movements. Because the touch is expected, it dampens the sensory response that makes an unexpected tickle feel intense.',

    explanation:
      'When you decide to move your hand, your brain generates predictions about the sensory consequences of that movement. It can compare those predictions with the incoming touch signals and reduce the response to sensations it expected. Someone else is much harder to predict, so externally produced tickling creates more surprise and a stronger sensation.',

    topicId: 'psychology',
    topic: 'Psychology',

    tags: [
      'brain',
      'touch',
      'prediction',
    ],

    concepts: [
      'self tickling',
      'sensory prediction',
      'self generated touch',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'generated',
      generationPrompt:
        'Conceptual editorial illustration of a person attempting to tickle their own side, playful but intelligent, realistic proportions, minimal composition, no text.',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-space-crying',

    hook:
      'Could you actually cry in space?',

    answer:
      'Yes. Your eyes still make tears, but without gravity pulling them down your cheeks, surface tension makes the liquid collect around your eyes instead.',

    explanation:
      'Gravity is not required for tear production, so astronauts can still cry. What changes is what happens afterward. In microgravity, tears tend to cling to the eye and surrounding skin rather than falling. As more liquid accumulates, it can form an increasingly uncomfortable watery blob that has to be wiped away.',

    topicId: 'space',
    topic: 'Space',

    tags: [
      'astronauts',
      'microgravity',
      'human-body',
    ],

    concepts: [
      'crying in space',
      'tears in microgravity',
      'surface tension',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'photo',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-recorded-voice',

    hook:
      'Why does your voice sound so different in a recording?',

    answer:
      'When you speak, you hear your voice through both the air and vibrations traveling through your skull. A recording gives you mostly the air-conducted version, so it sounds unfamiliar.',

    explanation:
      'Other people primarily hear sound waves traveling from your mouth through the air. You hear those too, but vibrations from your vocal cords also travel through the bones and tissues of your head to your inner ear. That additional path changes how your own voice sounds to you, often making it seem fuller or deeper than a recording does.',

    topicId: 'science',
    topic: 'Science',

    tags: [
      'sound',
      'hearing',
      'human-body',
    ],

    concepts: [
      'recorded voice',
      'bone conduction',
      'air conduction',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'generated',
      generationPrompt:
        'Editorial image of a person listening to a recording of their own voice with headphones, subtle surprised expression, clean modern photographic style, no text.',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-cleopatra',

    hook:
      'Was Cleopatra really closer to the Moon landing than to the Great Pyramid?',

    answer:
      'Yes. The Great Pyramid was already about 2,500 years old when Cleopatra lived, while the Apollo 11 Moon landing happened roughly 2,000 years after her lifetime.',

    explanation:
      'The Great Pyramid of Giza was completed around the 26th century BCE. Cleopatra VII lived from 69 to 30 BCE, near the very end of ancient Egyptian history. Apollo 11 landed on the Moon in 1969. We often compress Egyptian history into one mental period, but the civilization lasted so long that Cleopatra herself lived astonishingly far from the pyramid-building age.',

    quickFact:
      'To Cleopatra, the Great Pyramid was already more ancient than Cleopatra is to us.',

    topicId: 'history',
    topic: 'History',

    tags: [
      'egypt',
      'cleopatra',
      'pyramids',
      'timeline',
    ],

    concepts: [
      'Cleopatra timeline',
      'Great Pyramid age',
      'Apollo 11 timeline',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'archival',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-price-99',

    hook:
      'Why do prices ending in .99 still work on us?',

    answer:
      'We tend to give disproportionate weight to the leftmost digits of a price, so ₹999 can feel meaningfully cheaper than ₹1,000 even though the difference is only ₹1.',

    explanation:
      'This is often called the left-digit effect. Because numbers are processed from left to right, crossing a digit boundary can disproportionately change how a price feels. The effect is not identical for every shopper or every purchase, but charm pricing remains common because seemingly tiny numerical differences can influence price perception.',

    topicId: 'money',
    topic: 'Money',

    tags: [
      'pricing',
      'psychology',
      'shopping',
    ],

    concepts: [
      'charm pricing',
      'left digit effect',
      'price perception',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'photo',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-dream-forgetting',

    hook:
      'Why can a vivid dream disappear minutes after you wake up?',

    answer:
      'Dream memories are often weakly stored, and the flood of new thoughts and sensory information after waking can quickly interfere with them before they become stable memories.',

    explanation:
      'Memory formation during sleep differs from normal waking memory formation. When you wake, attention rapidly shifts toward your surroundings, plans and incoming sensory information. Unless you deliberately rehearse the dream, its fragile memory can be displaced quickly. Waking during or immediately after a dream can also make recall more likely.',

    topicId: 'psychology',
    topic: 'Psychology',

    tags: [
      'dreams',
      'sleep',
      'memory',
    ],

    concepts: [
      'dream recall',
      'dream memory',
      'memory consolidation',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'generated',
      generationPrompt:
        'Dreamlike editorial visual of a person waking while fragments of a vivid dream dissolve into the morning light, sophisticated surrealism, no text.',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-octopus-hearts',

    hook:
      'Why does an octopus need three hearts?',

    answer:
      'Two hearts pump blood through the gills to pick up oxygen, while the third pumps that oxygenated blood through the rest of the octopus’s body.',

    explanation:
      'Octopuses have a closed circulatory system built around three hearts. Two branchial hearts move blood through the gills, while the systemic heart supplies the rest of the body. Their blood also uses the copper-containing protein hemocyanin to transport oxygen, giving oxygenated octopus blood a bluish appearance.',

    quickFact:
      'The main systemic heart can reduce its activity when an octopus swims, one reason crawling is often less energetically demanding for it.',

    topicId: 'animals',
    topic: 'Animals',

    tags: [
      'octopus',
      'ocean',
      'biology',
    ],

    concepts: [
      'octopus hearts',
      'octopus circulation',
      'hemocyanin',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'photo',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-venus-day',

    hook:
      'How can a day on Venus be longer than its year?',

    answer:
      'Venus spins extremely slowly: one rotation relative to distant stars takes about 243 Earth days, while one orbit around the Sun takes about 225 Earth days.',

    explanation:
      'A planet’s rotation determines its sidereal day, while its orbit determines its year. Venus rotates not only very slowly but also in the opposite direction from most planets. Because it completes an orbit faster than it completes one rotation relative to the stars, its sidereal day is longer than its year.',

    topicId: 'space',
    topic: 'Space',

    tags: [
      'venus',
      'planets',
      'solar-system',
    ],

    concepts: [
      'Venus rotation',
      'Venus orbit',
      'sidereal day',
      'retrograde rotation',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'photo',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },

  {
    id: 'gold-doomscrolling',

    hook:
      'Why is doomscrolling so hard to stop even when it makes you feel worse?',

    answer:
      'Bad news creates uncertainty, and checking for another update can briefly feel like gaining information or control. Endless feeds make that checking loop extremely easy to repeat.',

    explanation:
      'Threatening information naturally captures attention because it may matter to our safety or decisions. When events are uncertain, another refresh promises the possibility of useful new information. Sometimes there is something new and sometimes there is not, creating an unpredictable feedback loop. The result can be continued checking even after the experience stops feeling rewarding.',

    topicId: 'internet',
    topic: 'Internet',

    tags: [
      'doomscrolling',
      'attention',
      'social-media',
    ],

    concepts: [
      'doomscrolling',
      'uncertainty reduction',
      'endless feeds',
      'attention loops',
    ],

    feedEligible: true,

    visual: {
      url: '',
      type: 'generated',
      generationPrompt:
        'Editorial nighttime scene of a person illuminated by a phone while scrolling an endless stream of information, contemplative rather than dystopian, no readable text.',
    },

    connections: [],

    sources: [],

    editorial: {
      status: 'draft',
      factChecked: false,
    },
  },
];
