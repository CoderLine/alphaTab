// Chapter registry for the Render feature group.
//
// Each entry defines one chapter (H2 section) on
// `docs/features/render/index.mdx`. The auto-generated card grid for
// a chapter is populated from every `.mdx` file under this directory
// whose frontmatter has `sidebar_custom_props.feature_chapter` equal
// to the chapter `id`.
//
// To add a chapter, insert a new entry here (order = display order),
// then set `feature_chapter: <id>` in the frontmatter of every feature
// page (or external-link stub) that should appear in it.

import type { CardAccent } from '@site/src/components/FeatureCard';

export interface FeatureChapter {
  /** Stable id — matches `sidebar_custom_props.feature_chapter`. */
  id: string;
  /** H2 heading rendered above the grid. */
  label: string;
  /** Anchor hash — falls back to `id` if omitted. */
  anchor?: string;
  /** Optional intro paragraph rendered between H2 and grid. */
  description?: string;
  /** Default accent color for cards in this chapter. */
  defaultAccent?: CardAccent;
}

const chapters: FeatureChapter[] = [
  {
    id: 'layout',
    label: 'Layout',
    anchor: 'layout',
    defaultAccent: 'violet',
  },
  {
    id: 'notation-types',
    label: 'Notation types',
    anchor: 'notation-types',
    defaultAccent: 'violet',
  },
  {
    id: 'backends',
    label: 'Backends',
    anchor: 'backends',
    defaultAccent: 'violet',
  },
  {
    id: 'fonts',
    label: 'Fonts & symbols',
    anchor: 'fonts',
    defaultAccent: 'violet',
  },
  {
    id: 'stylesheet',
    label: 'Score-wide display policies',
    anchor: 'stylesheet',
    description:
      'Score-level toggles that live on `score.stylesheet` and apply to the whole document.',
    defaultAccent: 'violet',
  },
  {
    id: 'coloring',
    label: 'Coloring & element styling',
    anchor: 'coloring',
    defaultAccent: 'violet',
  },
  {
    id: 'notation-coverage',
    label: 'Notation coverage',
    anchor: 'coverage',
    description:
      "alphaTab renders the full grammar of Western music notation and the guitar-specific effects Guitar Pro supports. Each entry below has a rendered example — pick a category to jump straight to the demos.",
    defaultAccent: 'slate',
  },
];

export default chapters;
