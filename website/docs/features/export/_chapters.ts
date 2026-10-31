// Chapter registry for the Export feature group.
//
// Each entry defines one chapter (H2 section) on
// `docs/features/export/index.mdx`. The auto-generated card grid for
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
    id: 'score-formats',
    label: 'Score formats',
    anchor: 'score-formats',
    defaultAccent: 'rose',
  },
  {
    id: 'midi',
    label: 'MIDI',
    anchor: 'midi',
    defaultAccent: 'rose',
  },
  {
    id: 'audio',
    label: 'Audio',
    anchor: 'audio',
    defaultAccent: 'rose',
  },
  {
    id: 'serialization',
    label: 'Model serialization',
    anchor: 'serialization',
    defaultAccent: 'rose',
  },
];

export default chapters;
