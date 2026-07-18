// Chapter registry for the Extend feature group.
//
// Each entry defines one chapter (H2 section) on
// `docs/features/extend/index.mdx`. The auto-generated card grid for
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
    id: 'model',
    label: 'Model manipulation',
    anchor: 'model',
    defaultAccent: 'slate',
  },
  {
    id: 'workers',
    label: 'Custom bundling & workers',
    anchor: 'workers',
    defaultAccent: 'slate',
  },
  {
    id: 'hosting',
    label: 'Native platform hosting',
    anchor: 'hosting',
    defaultAccent: 'slate',
  },
];

export default chapters;
