// Chapter registry for the Play & sync feature group.
//
// Each entry defines one chapter (H2 section) on
// `docs/features/play-sync/index.mdx`. The auto-generated card grid for
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
    id: 'transport',
    label: 'Transport',
    anchor: 'transport',
    defaultAccent: 'emerald',
  },
  {
    id: 'mixer',
    label: 'The mixer',
    anchor: 'mixer',
    defaultAccent: 'emerald',
  },
  {
    id: 'feel',
    label: 'Playback feel',
    anchor: 'feel',
    defaultAccent: 'emerald',
  },
  {
    id: 'synthesis',
    label: 'Audio synthesis',
    anchor: 'synthesis',
    defaultAccent: 'emerald',
  },
  {
    id: 'backends',
    label: 'Audio backends per platform',
    anchor: 'backends',
    defaultAccent: 'emerald',
  },
  {
    id: 'sync',
    label: 'External media sync',
    anchor: 'sync',
    defaultAccent: 'emerald',
  },
];

export default chapters;
