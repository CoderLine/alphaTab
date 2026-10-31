// Chapter registry for the Interact feature group.
//
// Each entry defines one chapter (H2 section) on
// `docs/features/interact/index.mdx`. The auto-generated card grid for
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
    id: 'cursor',
    label: 'Playback cursor',
    anchor: 'cursor',
    defaultAccent: 'amber',
  },
  {
    id: 'scroll',
    label: 'Scroll behavior',
    anchor: 'scroll',
    defaultAccent: 'amber',
  },
  {
    id: 'mouse',
    label: 'Mouse and touch',
    anchor: 'mouse',
    defaultAccent: 'amber',
  },
  {
    id: 'bounds',
    label: 'Bounds and hit-testing',
    anchor: 'bounds',
    defaultAccent: 'amber',
  },
  {
    id: 'selection',
    label: 'Selection',
    anchor: 'selection',
    defaultAccent: 'amber',
  },
];

export default chapters;
