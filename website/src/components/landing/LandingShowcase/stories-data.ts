// PLACEHOLDER — replace with real refs.
// Project names, quotes, publications and statistics are illustrative only.

export type ShowcaseStory =
  | {
      cardType: 'project';
      name: string;
      type: string;
      glyph: string;
      accent: string;
      quote: string;
      person: string;
      role: string;
      stat: { k: string; l: string };
      sample: { tuning: string; key: string; tempo: number };
    }
  | {
      cardType: 'quote';
      accent: string;
      quote: string;
      person: string;
      handle?: string;
      role: string;
      source: string;
      sourceLabel: string;
    }
  | {
      cardType: 'press';
      accent: string;
      publication: string;
      publicationMark: string;
      date: string;
      quote: string;
      sourceLabel: string;
      pages: string;
    };

export const SHOWCASE_STORIES: ShowcaseStory[] = [
  {
    cardType: 'project',
    name: 'Songbook',
    type: 'Tab archive',
    glyph: 'S',
    accent: '#5b76d8',
    quote:
      'We swapped three rendering vendors for a single alphaTab pipeline. Score load times dropped 4× and two engineers now maintain the whole stack.',
    person: 'Maya Chen',
    role: 'Engineering Lead',
    stat: { k: '12M', l: 'scores rendered / month' },
    sample: { tuning: 'D A D G B E', key: 'D major', tempo: 132 },
  },
  {
    cardType: 'quote',
    accent: '#208a73',
    quote:
      'Wired up alphaTab to our React app in an afternoon. The event API is so clean we threw out 600 lines of custom rendering code.',
    person: 'Jonas Wilk',
    handle: '@jonaswilk',
    role: 'Open-source contributor',
    source: 'GitHub discussion #842',
    sourceLabel: 'github.com',
  },
  {
    cardType: 'project',
    name: 'Loop',
    type: 'Practice tool',
    glyph: 'L',
    accent: '#208a73',
    quote:
      'Beat-accurate cursor plus range-looping is what made the product viable. We subscribe to the event stream and the UI just follows.',
    person: 'Jonas Wilk',
    role: 'Founder',
    stat: { k: '180k', l: 'practice sessions logged' },
    sample: { tuning: 'E A D G B E', key: 'A minor', tempo: 96 },
  },
  {
    cardType: 'press',
    accent: '#c07a3e',
    publication: 'Web Audio Weekly',
    publicationMark: 'WAW',
    date: 'Issue #312 · March 2025',
    quote:
      "The only browser-native music-notation library that's production-ready for guitar tab, score and percussion in the same render pipeline.",
    sourceLabel: 'webaudioweekly.dev / 312',
    pages: 'p. 04–07',
  },
  {
    cardType: 'project',
    name: 'Lyra',
    type: 'Music academy',
    glyph: '♪',
    accent: '#a64570',
    quote:
      'Tutors author once in MusicXML — we serve standard, tab and jiǎnpǔ staves to different cohorts. One score, three reading systems.',
    person: 'Dr. Hana Park',
    role: 'Curriculum Director',
    stat: { k: '24', l: 'partner conservatories' },
    sample: { tuning: 'E A D G B E', key: 'C major', tempo: 80 },
  },
  {
    cardType: 'quote',
    accent: '#7a5cc0',
    quote:
      'Best decision we made this year was dropping our in-house renderer for alphaTab. The Kotlin runtime ships on Android with no JS bridge.',
    person: 'Aki Romero',
    handle: '@signalflux',
    role: 'Mobile engineer',
    source: 'X · post · Feb 14',
    sourceLabel: 'twitter.com',
  },
  {
    cardType: 'project',
    name: 'Cadence',
    type: 'Composer suite',
    glyph: 'C',
    accent: '#3e8eb3',
    quote:
      'We ship alphaTab on .NET for the desktop app and the exact same code in the browser for sharing. Single codepath, two surfaces, no porting.',
    person: 'Elena Voss',
    role: 'Principal Engineer',
    stat: { k: '6.4k', l: 'composers on platform' },
    sample: { tuning: 'E A D G B E', key: 'G minor', tempo: 108 },
  },
  {
    cardType: 'press',
    accent: '#5b76d8',
    publication: 'Music Software Monthly',
    publicationMark: 'MSM',
    date: 'April 2025 · review',
    quote:
      'A reference implementation for what an open music-notation SDK should look like in 2025. Bundle size and runtime parity are both best-in-class.',
    sourceLabel: 'msm.review / alphatab-1-8',
    pages: 'p. 12',
  },
  {
    cardType: 'project',
    name: 'Backbeat',
    type: 'Drum tutor',
    glyph: 'B',
    accent: '#c07a3e',
    quote:
      'Percussion notation is hard. alphaTab handled it without a single custom glyph — and the synth gives students real audio out of the box.',
    person: 'Marcus Ade',
    role: 'Lead Developer',
    stat: { k: '4.7★', l: 'avg. store rating' },
    sample: { tuning: 'drum kit', key: '4/4', tempo: 120 },
  },
  {
    cardType: 'quote',
    accent: '#3e8eb3',
    quote:
      'I expected to spend a weekend evaluating renderers. I picked alphaTab in an hour and never looked back.',
    person: 'Priya Nair',
    handle: '@pn_codes',
    role: 'Freelance dev',
    source: 'Personal blog · "Picking a tab renderer"',
    sourceLabel: 'priyanair.dev',
  },
  {
    cardType: 'project',
    name: 'Sheet',
    type: 'Score library',
    glyph: 'Σ',
    accent: '#7a5cc0',
    quote:
      'PDF + SVG export means we ship offline packs from the same source our online catalogue uses. Librarians author once and we distribute everywhere.',
    person: 'Tomas Becker',
    role: 'CTO',
    stat: { k: '92k', l: 'works in catalogue' },
    sample: { tuning: 'E A D G B E', key: 'E minor', tempo: 144 },
  },
];
