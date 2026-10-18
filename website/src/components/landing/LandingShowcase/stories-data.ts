/**
 * `pending`: the author has not yet been asked whether we may feature their words.
 * `not-needed`: the entry cites the author's own public credit or announcement.
 */
export type Outreach = 'pending' | 'not-needed';

export interface ShowcaseLink {
  label: string;
  url: string;
}

/** A project card carries either the builder's own words or, lacking those, our factual summary. */
export type ProjectVoice =
  | {
      /** Verbatim; omissions are marked with an ellipsis. */
      quote: string;
      /** Falls back to the project name when the author is anonymous. */
      person?: string;
      role?: string;
      /** Where the quote was published. */
      source: ShowcaseLink;
      summary?: never;
    }
  | {
      /** Written by us; rendered without quotation marks so it never reads as the project's words. */
      summary: string;
      quote?: never;
      person?: never;
      role?: never;
      source?: never;
    };

export const SHOWCASE_TAGS = {
  learning: 'Learning',
  practice: 'Practice',
  player: 'Player',
  editor: 'Editor',
  plugin: 'Plugin',
  web: 'Web',
  mobile: 'Mobile',
  desktop: 'Desktop',
  'open-source': 'Open source',
} as const;

export type ShowcaseTag = keyof typeof SHOWCASE_TAGS;

export type ShowcaseStory =
  | ({
      cardType: 'project';
      id: string;
      /** Short label for the switcher chip. */
      chip: string;
      name: string;
      type: string;
      glyph: string;
      accent: string;
      url: string;
      /** Always drawn into the landing selection and listed first on the showcase page. */
      featured?: boolean;
      /** One or two sentences for the showcase page. */
      description: string;
      tags: ShowcaseTag[];
      sourceCode?: string;
      /** The project's own announcement, e.g. its Show and tell post. */
      announcement?: string;
      /** One-line summary shown in the preview frame. */
      meta: string;
      stat?: { k: string; l: string };
      /**
       * Path below `static/`. Fills the 460×224 CSS px preview with `object-fit: cover` anchored
       * top-left, so supply 920×448. Without it the preview shows decorative notation.
       */
      screenshot?: string;
      outreach: Outreach;
    } & ProjectVoice)
  | {
      cardType: 'quote';
      id: string;
      chip: string;
      accent: string;
      /** Verbatim. */
      quote: string;
      person: string;
      handle?: string;
      role: string;
      source: ShowcaseLink;
      outreach: Outreach;
    }
  | {
      cardType: 'press';
      id: string;
      chip: string;
      kind: 'research' | 'press';
      accent: string;
      publication: string;
      date: string;
      /** Verbatim; footnote markers dropped. */
      quote: string;
      byline: string;
      url: string;
      outreach: Outreach;
    };

/** Pool the page draws from on load; the server render uses the first `SHOWCASE_SLOTS` entries of each type. */
export const SHOWCASE_STORIES: ShowcaseStory[] = [
  // TODO(outreach): ask Infinite Guitar for a testimonial to replace the summary, and confirm featuring them
  // with the preview: the public "Pentatonic Pathways: Intro to the Scale" lesson page with its header kept,
  // the video left out and the author's name and photo blurred.
  {
    cardType: 'project',
    id: 'infiniteguitar',
    chip: 'Infinite Guitar',
    name: 'Infinite Guitar',
    type: 'Video guitar lessons',
    glyph: 'I',
    accent: '#c07a3e',
    url: 'https://www.infiniteguitar.com',
    featured: true,
    summary: 'Video lessons paired with interactive tablature, rendered and played back by alphaTab.',
    description:
      'Video guitar lessons with interactive tablature, rendered and played back by alphaTab.',
    tags: ['learning', 'web'],
    meta: 'Lessons with Guitar Pro tabs',
    screenshot: '/img/showcase/infiniteguitar.webp',
    outreach: 'pending',
  },
  // TODO(outreach): ask Fretello for a testimonial to replace the summary, and for consent to use their
  // App Store screenshots (fretello.com/assets/images/screenshots/{listen,learn}.jpg) in the preview.
  {
    cardType: 'project',
    id: 'fretello',
    chip: 'Fretello',
    name: 'Fretello',
    type: 'Guitar learning app',
    glyph: 'F',
    accent: '#a64570',
    url: 'https://fretello.com',
    featured: true,
    summary: 'Guitar lessons and play-along exercises on iOS and Android, with tabs rendered by alphaTab.',
    description:
      'Guitar learning app for iOS and Android: lessons, exercises and play-alongs with tabs rendered by alphaTab.',
    tags: ['learning', 'mobile'],
    meta: 'iOS · Android',
    screenshot: '/img/showcase/fretello.webp',
    outreach: 'pending',
  },
  // TODO(outreach): confirm in discussion #2930 that the app screenshot (our Iron Waltz demo file) may be used.
  {
    cardType: 'project',
    id: 'smart-beat',
    chip: 'Smart Beat',
    name: 'Smart Beat',
    type: 'Desktop tab editor',
    glyph: 'S',
    accent: '#5b76d8',
    url: 'https://smart-beat.app',
    quote: 'Special thanks to alphaTab, the heart of Smart Beat: this project would not exist without it.',
    source: { label: 'smart-beat.app', url: 'https://smart-beat.app' },
    description:
      'Free tablature editor for macOS, Windows and Linux in the spirit of Guitar Pro 5, with optional AI features such as hum to accompaniment.',
    tags: ['editor', 'desktop', 'open-source'],
    sourceCode: 'https://github.com/mbalyi/smart-beat',
    announcement: 'https://github.com/CoderLine/alphaTab/discussions/2930',
    meta: 'Tauri · React · desktop',
    screenshot: '/img/showcase/smart-beat.webp',
    outreach: 'pending',
  },
  // TODO(outreach): Reddit comment by u/louislamlam; confirm the quote and the use of his real name.
  {
    cardType: 'project',
    id: 'its-mytabs',
    chip: "It's MyTabs",
    name: "It's MyTabs",
    type: 'Self-hosted tab player',
    glyph: 'M',
    accent: '#208a73',
    url: 'https://its-mytabs.kuma.pet',
    quote: 'If no one made this engine, my project would not be possible in the first place.',
    person: 'Louis Lam',
    role: 'Creator',
    source: {
      label: 'reddit.com/r/selfhosted',
      url: 'https://www.reddit.com/r/selfhosted/comments/1quwa2x/louis_lam_one_of_the_greats/o3gnvmy/',
    },
    description:
      'Open-source, self-hostable guitar and bass tab viewer and player, similar to Songsterr, with audio file and YouTube sync.',
    tags: ['player', 'web', 'open-source'],
    sourceCode: 'https://github.com/louislam/its-mytabs',
    meta: 'Open source · audio & YouTube sync',
    screenshot: '/img/showcase/its-mytabs.webp',
    outreach: 'pending',
  },
  // TODO(outreach): Hacker News comment; reply on the thread before treating this as final.
  {
    cardType: 'quote',
    id: 'hn-webprofusion',
    chip: 'Hacker News',
    accent: '#5b76d8',
    quote:
      'If you ever need to build a piece of software that shows guitar tab then this is basically the library to use (across multiple platforms).',
    person: 'webprofusion',
    role: 'Hacker News commenter',
    source: { label: 'news.ycombinator.com', url: 'https://news.ycombinator.com/item?id=40835858' },
    outreach: 'pending',
  },
  // TODO(outreach): courtesy ask on Show and tell #2315 for using the README screenshot of their UI.
  {
    cardType: 'project',
    id: 'tab-flow',
    chip: 'Tab Flow',
    name: 'Tab Flow',
    type: 'Obsidian plugin',
    glyph: 'T',
    accent: '#7a5cc0',
    url: 'https://github.com/LIUBINfighter/Obsidian-Tab-Flow',
    quote: 'The official Electron/Obsidian support, complete with the sample plugin, is a dream come true.',
    person: 'Jay Bridge',
    role: 'Creator',
    source: {
      label: 'GitHub discussion #2160',
      url: 'https://github.com/CoderLine/alphaTab/discussions/2160#discussioncomment-13644424',
    },
    description:
      'Obsidian plugin that renders and plays Guitar Pro and alphaTex files inside your vault.',
    tags: ['plugin', 'open-source'],
    sourceCode: 'https://github.com/LIUBINfighter/Obsidian-Tab-Flow',
    announcement: 'https://github.com/CoderLine/alphaTab/discussions/2315',
    meta: 'Guitar tabs inside Obsidian notes',
    // TODO(verify): download count as of 2026-10-17; refresh from the Obsidian plugin stats before release.
    stat: { k: '1,264', l: 'Obsidian downloads' },
    screenshot: '/img/showcase/tab-flow.webp',
    outreach: 'pending',
  },
  // TODO(outreach): courtesy note on Show and tell #2694.
  {
    cardType: 'project',
    id: 'drumforge',
    chip: 'Drumforge',
    name: 'Drumforge',
    type: 'Drum exercise generator',
    glyph: 'D',
    accent: '#c07a3e',
    url: 'https://drumforge.app',
    quote: "Huge thanks to @Danielku15 and everyone contributing to alphaTab — Drumforge wouldn't exist without it.",
    person: 'Narek Ghevandiani',
    role: 'Creator',
    source: { label: 'GitHub Show and tell', url: 'https://github.com/CoderLine/alphaTab/discussions/2694' },
    description:
      'Drum practice exercises generated as alphaTex, with playback and a synchronized cursor.',
    tags: ['practice', 'web', 'open-source'],
    sourceCode: 'https://github.com/narghev/drumforge',
    announcement: 'https://github.com/CoderLine/alphaTab/discussions/2694',
    meta: 'Exercises generated as alphaTex',
    screenshot: '/img/showcase/drumforge.webp',
    outreach: 'pending',
  },
  {
    cardType: 'quote',
    id: 'show-and-tell-2872',
    chip: 'Show and tell',
    accent: '#208a73',
    quote:
      'alphaTab is hands down one of the most impressive browser-based music notation and MIDI playback engines out there.',
    person: 'maxcomperatore',
    handle: '@maxcomperatore',
    role: 'Developer',
    source: { label: 'GitHub Show and tell', url: 'https://github.com/CoderLine/alphaTab/discussions/2872' },
    outreach: 'not-needed',
  },
  // TODO(outreach): courtesy ask on Show and tell #1728 for using a screenshot of their UI.
  {
    cardType: 'project',
    id: 'gonb',
    chip: 'Gonb',
    name: 'Gonb',
    type: 'Melody practice tool',
    glyph: 'G',
    accent: '#3e8eb3',
    url: 'https://bali182.github.io/gonb/',
    quote:
      'AlphaTab is the most important part of it, as without it neither playback nor score rendering would work so nicely and seamlessly…',
    person: 'Balázs Édes',
    role: 'Creator',
    source: { label: 'GitHub Show and tell', url: 'https://github.com/CoderLine/alphaTab/discussions/1728' },
    description:
      'Sight-reading practice: generates melodies on demand and plays them back.',
    tags: ['practice', 'web', 'open-source'],
    sourceCode: 'https://github.com/bali182/gonb',
    announcement: 'https://github.com/CoderLine/alphaTab/discussions/1728',
    meta: 'Generated melodies with playback',
    screenshot: '/img/showcase/gonb.webp',
    outreach: 'pending',
  },
];

function isFeatured(s: ShowcaseStory): boolean {
  return s.cardType === 'project' && s.featured === true;
}

/** Cards shown per page load, by type. */
export const SHOWCASE_SLOTS: Record<ShowcaseStory['cardType'], number> = { project: 4, press: 2, quote: 2 };

/**
 * Draws `slots` cards per type, featured projects first (all of them when `random` is omitted, in
 * authored order), then
 * interleaves the types so neighbouring cards never share a type while another type remains.
 * The type with the most cards left goes next, so projects lead.
 */
export function arrangeStories(
  stories: ShowcaseStory[],
  slots: Record<ShowcaseStory['cardType'], number>,
  random?: () => number,
): ShowcaseStory[] {
  const buckets = new Map<ShowcaseStory['cardType'], ShowcaseStory[]>();
  for (const s of stories) {
    const bucket = buckets.get(s.cardType) ?? [];
    bucket.push(s);
    buckets.set(s.cardType, bucket);
  }
  const pick = random ?? (() => 0);
  let total = 0;
  for (const [type, bucket] of buckets) {
    if (random) {
      for (let i = bucket.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bucket[i], bucket[j]] = [bucket[j], bucket[i]];
      }
    }
    bucket.sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)));
    bucket.splice(slots[type]);
    total += bucket.length;
  }

  const result: ShowcaseStory[] = [];
  let last: ShowcaseStory['cardType'] | undefined;
  while (result.length < total) {
    const candidates = [...buckets.entries()].filter(([, b]) => b.length > 0);
    const pool = candidates.some(([t]) => t !== last) ? candidates.filter(([t]) => t !== last) : candidates;
    const most = Math.max(...pool.map(([, b]) => b.length));
    const top = pool.filter(([, b]) => b.length === most);
    const [type, bucket] = top[Math.floor(pick() * top.length)];
    result.push(bucket.shift()!);
    last = type;
  }
  return result;
}
