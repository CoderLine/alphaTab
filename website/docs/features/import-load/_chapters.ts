// Chapter registry for the Import & load feature group.
//
// Each entry defines one chapter (H2 section) on
// `docs/features/import-load/index.mdx`. The auto-generated card grid for
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
    id: 'loading',
    label: 'Loading a score',
    anchor: 'loading',
    defaultAccent: 'sky',
  },
  {
    id: 'formats',
    label: 'Supported input formats',
    anchor: 'formats',
    defaultAccent: 'sky',
  },
  {
    id: 'configuration',
    label: 'Importer configuration',
    anchor: 'configuration',
    defaultAccent: 'sky',
  },
  {
    id: 'lifecycle',
    label: 'Load lifecycle',
    anchor: 'lifecycle',
    defaultAccent: 'sky',
  },
];

export default chapters;
