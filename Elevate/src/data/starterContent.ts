import {ContentItem} from '../types/content';

export const STARTER_CONTENT: ContentItem[] = [
  {
    id: 'starter-octopus-hearts', topic: 'animals', tags: ['ocean', 'biology'],
    format: 'visualFact', origin: 'evergreen', status: 'published',
    hook: 'OCTOPUSES HAVE THREE HEARTS',
    body: 'When they swim, the heart that serves their body actually stops beating.',
    visual: {type: 'icon', emoji: '🐙'}, accent: '#FFD0E1', qualityScore: 96,
  },
  {
    id: 'starter-mars-sunset', topic: 'space', tags: ['mars', 'light'],
    format: 'visualFact', origin: 'evergreen', status: 'published',
    hook: 'Sunsets on Mars are BLUE.',
    body: 'Fine Martian dust scatters blue light around the Sun—the opposite of our warm red sunsets.',
    visual: {type: 'graphic', emoji: '🌅'}, accent: '#CAD8FF', qualityScore: 98,
  },
  {
    id: 'starter-cleopatra', topic: 'history', tags: ['egypt', 'time'],
    format: 'perspective', origin: 'evergreen', status: 'published',
    hook: 'Cleopatra lived closer to the iPhone than to the Great Pyramid.',
    body: 'The pyramid was already about 2,500 years old when Cleopatra was born.',
    visual: {type: 'icon', emoji: '⏳'}, accent: '#FFE4B7', qualityScore: 94,
  },
  {
    id: 'starter-brain-edit', topic: 'psychology', tags: ['memory', 'mind'],
    format: 'explanation', origin: 'evergreen', status: 'published',
    hook: 'Your brain edits a memory every time you remember it.',
    body: 'Recalling a memory can make it briefly flexible, so details may shift before it is stored again.',
    visual: {type: 'illustration', emoji: '🧠'}, accent: '#DED5FF', qualityScore: 92,
  },
  {
    id: 'starter-disappear', topic: 'world', tags: ['travel', 'choice'],
    format: 'choice', origin: 'evergreen', status: 'published',
    hook: 'You have ₹10 crore. Where do you disappear for a year?',
    choices: [
      {id: 'cabin', label: 'Swiss cabin', emoji: '🏔️', percentage: 38},
      {id: 'villa', label: 'Maldives villa', emoji: '🏝️', percentage: 24},
      {id: 'city', label: 'New York', emoji: '🌃', percentage: 15},
      {id: 'country', label: 'Japan countryside', emoji: '🌸', percentage: 23},
    ],
    visual: {type: 'none'}, accent: '#D3F2E7', qualityScore: 90,
  },
  {
    id: 'starter-cloud-weight', topic: 'science', tags: ['weather', 'scale'],
    format: 'microFact', origin: 'evergreen', status: 'published',
    hook: 'That fluffy cloud can weigh 500,000 kg.',
    body: 'A typical cumulus cloud contains an enormous number of tiny suspended water droplets.',
    visual: {type: 'icon', emoji: '☁️'}, accent: '#D4EDFF', qualityScore: 91,
  },
  {
    id: 'starter-door', topic: 'weird-stuff', tags: ['interactive', 'reveal'],
    format: 'reveal', origin: 'evergreen', status: 'published',
    hook: 'Pick a door. Any door.',
    body: 'There is no wrong answer. Just one strange destination.',
    revealText: 'You found a hotel in Japan staffed by robot dinosaurs. 🦖',
    visual: {type: 'icon', emoji: '🚪'}, accent: '#FFE1B8', qualityScore: 88,
  },
];
