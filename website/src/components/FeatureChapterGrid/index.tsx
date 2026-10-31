/**
 * <FeatureChapterGrid group="render" chapter="layout" />
 *
 * Renders an auto-generated grid of <FeatureCard>s for a single chapter
 * on a feature group's index page. Cards are collected from every .mdx
 * file under `docs/features/<group>/` whose frontmatter matches.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  Frontmatter schema for a feature page (or stub)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ```yaml
 * title: Justify last system                # required — card title
 * description: Stretch the last row...      # required — card hook
 * sidebar_custom_props:
 *   feature_chapter: layout                 # required — chapter id from _chapters.ts
 *   since: "1.3"                            # optional — small "since" pill on the card
 *   feature_platforms: [web, net, android]  # optional — platform pills; omit for "all"
 *   feature_accent: violet                  # optional — accent colour override
 *   feature_hook: ...                       # optional — overrides description as hook
 *   feature_order: 20                       # optional — sort within chapter (asc)
 *   feature_external_link: /docs/...        # only for stub cards — target URL
 * unlisted: true                            # only for stub cards — hides them from the sidebar
 * ```
 *
 * A feature page's card links to the page itself. A stub with
 * `feature_external_link` links to the given URL instead. Ordering:
 * feature_order asc, then sidebar_position asc, then title asc.
 *
 * To add a new feature: drop a `.mdx` file into the group directory with
 * the frontmatter above. That's the whole workflow.
 */

import React, { useMemo } from 'react';
import {
  useDocsSidebar,
  useDocsVersion,
} from '@docusaurus/plugin-content-docs/client';
import type {
  PropSidebarItem,
  PropSidebarItemLink,
  PropSidebarItemCategory,
  PropVersionDocs,
} from '@docusaurus/plugin-content-docs';
import {
  FeatureCard,
  FeatureGrid,
  type CardAccent,
  type Platform,
} from '@site/src/components/FeatureCard';

export interface FeatureChapterGridProps {
  /** Group directory under `docs/features/`, e.g. `"render"`. */
  group: string;
  /** Chapter id — must match a `feature_chapter` value in the group. */
  chapter: string;
  /** Grid density. Defaults to 3 columns. */
  columns?: 2 | 3;
  /** Default accent applied when a card has no `feature_accent`. */
  defaultAccent?: CardAccent;
}

interface FeatureItem {
  title: string;
  hook?: string;
  link: string;
  since?: string;
  platforms?: Platform[];
  accent?: CardAccent;
  order: number;
}

const KNOWN_ACCENTS: readonly CardAccent[] = [
  'sky',
  'violet',
  'amber',
  'emerald',
  'rose',
  'slate',
];

const KNOWN_PLATFORMS: readonly Platform[] = ['web', 'net', 'android'];

function normalizeAccent(v: unknown): CardAccent | undefined {
  return typeof v === 'string' && (KNOWN_ACCENTS as readonly string[]).includes(v)
    ? (v as CardAccent)
    : undefined;
}

function normalizePlatforms(v: unknown): Platform[] | undefined {
  if (!Array.isArray(v)) { return undefined; }
  const out = v.filter((x): x is Platform =>
    typeof x === 'string' && (KNOWN_PLATFORMS as readonly string[]).includes(x),
  );
  return out.length > 0 ? out : undefined;
}

/**
 * Walk the sidebar tree and yield every link item, regardless of depth.
 * Uses `docId` to identify docs so we can filter by directory.
 */
function collectLinks(items: readonly PropSidebarItem[]): PropSidebarItemLink[] {
  const out: PropSidebarItemLink[] = [];
  const visit = (list: readonly PropSidebarItem[]) => {
    for (const item of list) {
      if (item.type === 'link') {
        out.push(item as PropSidebarItemLink);
      } else if (item.type === 'category') {
        const cat = item as PropSidebarItemCategory;
        visit(cat.items);
      }
    }
  };
  visit(items);
  return out;
}

function buildFeatureItem(
  link: PropSidebarItemLink,
  group: string,
  chapter: string,
  docs: PropVersionDocs,
): FeatureItem | null {
  // Custom props on a sidebar link come from the doc's `sidebar_custom_props`
  // frontmatter (Docusaurus copies them across in `toSidebarDocItemLinkProp`).
  const cp = (link.customProps ?? {}) as Record<string, unknown>;

  const featureChapter = cp['feature_chapter'];
  if (featureChapter !== chapter) { return null; }

  // Confirm the doc actually lives under the requested group directory.
  const docId = link.docId ?? '';
  if (!docId.startsWith(`features/${group}/`) && docId !== `features/${group}`) {
    return null;
  }

  const externalLink = cp['feature_external_link'];
  const hookOverride = cp['feature_hook'];
  const since = cp['since'];
  const orderRaw = cp['feature_order'];

  const target =
    typeof externalLink === 'string' && externalLink.length > 0
      ? externalLink
      : link.href;

  // Fall back to the doc's frontmatter `description` for the card hook.
  // Sidebar links don't carry description themselves, but the version's
  // docs map does.
  const docDescription = docs[docId]?.description;

  const hook =
    typeof hookOverride === 'string' && hookOverride.length > 0
      ? hookOverride
      : typeof docDescription === 'string' && docDescription.length > 0
        ? docDescription
        : undefined;

  return {
    title: link.label,
    hook,
    link: target,
    since:
      typeof since === 'string' || typeof since === 'number'
        ? String(since)
        : undefined,
    platforms: normalizePlatforms(cp['feature_platforms']),
    accent: normalizeAccent(cp['feature_accent']),
    order:
      typeof orderRaw === 'number'
        ? orderRaw
        : typeof orderRaw === 'string' && !Number.isNaN(Number(orderRaw))
          ? Number(orderRaw)
          : Number.POSITIVE_INFINITY,
  };
}

export const FeatureChapterGrid: React.FC<FeatureChapterGridProps> = ({
  group,
  chapter,
  columns = 3,
  defaultAccent,
}) => {
  const sidebar = useDocsSidebar();
  const version = useDocsVersion();

  const items = useMemo(() => {
    if (!sidebar) { return []; }
    const links = collectLinks(sidebar.items);
    const collected: FeatureItem[] = [];
    for (const link of links) {
      const item = buildFeatureItem(link, group, chapter, version.docs);
      if (!item) { continue; }
      collected.push(item);
    }
    collected.sort((a, b) => {
      if (a.order !== b.order) { return a.order - b.order; }
      return a.title.localeCompare(b.title);
    });
    return collected;
  }, [sidebar, version.docs, group, chapter]);

  if (items.length === 0) {
    // Render nothing when no cards match — keeps H2 layout clean in dev while a
    // chapter is being filled in. Docs authors get an empty grid until they add
    // stub .mdx files.
    return null;
  }

  return (
    <FeatureGrid columns={columns}>
      {items.map((it) => (
        <FeatureCard
          key={it.link + '|' + it.title}
          title={it.title}
          hook={it.hook}
          link={it.link}
          since={it.since}
          platforms={it.platforms}
          accent={it.accent ?? defaultAccent}
        />
      ))}
    </FeatureGrid>
  );
};

export default FeatureChapterGrid;
