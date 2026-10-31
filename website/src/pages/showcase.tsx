import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  SHOWCASE_STORIES,
  SHOWCASE_TAGS,
  type ShowcaseStory,
  type ShowcaseTag,
} from '@site/src/components/landing/LandingShowcase/stories-data';
import { ProjectMark } from '@site/src/components/landing/LandingShowcase/project-mark';
import { IconArrow, IconExternalLink } from '@site/src/components/landing/shared/icons';
import styles from './showcase.module.scss';

type Project = Extract<ShowcaseStory, { cardType: 'project' }>;

const SHOW_AND_TELL_URL = 'https://github.com/CoderLine/alphaTab/discussions/categories/show-and-tell';
const NEW_POST_URL = 'https://github.com/CoderLine/alphaTab/discussions/new?category=show-and-tell';

const PROJECTS: Project[] = SHOWCASE_STORIES.filter((s): s is Project => s.cardType === 'project').sort(
  (a, b) => Number(b.featured === true) - Number(a.featured === true) || a.name.localeCompare(b.name),
);

const TAG_COUNTS = PROJECTS.reduce((counts, p) => {
  for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}, new Map<ShowcaseTag, number>());

const TAGS = (Object.keys(SHOWCASE_TAGS) as ShowcaseTag[]).filter((t) => TAG_COUNTS.has(t));

function hostOf(url: string): string {
  return new URL(url).host.replace(/^www\./, '');
}

const ProjectTile: React.FC<{ project: Project }> = ({ project }) => {
  const screenshot = useBaseUrl(project.screenshot ?? '');
  return (
    <li className={styles.tile} style={{ '--story-accent': project.accent } as React.CSSProperties}>
      <a className={styles.tileVisual} href={project.url} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
        {project.screenshot ? (
          <img src={screenshot} alt={`${project.name} rendering music with alphaTab`} loading="lazy" />
        ) : (
          <span className={styles.tileFallback} aria-hidden="true">
            <ProjectMark size={56} glyph={project.glyph} accent={project.accent} />
            <span>{hostOf(project.url)}</span>
          </span>
        )}
      </a>
      <div className={styles.tileBody}>
        <div className={styles.tileHead}>
          <h3 className={styles.tileName}>
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              {project.name}
            </a>
          </h3>
          {project.featured && <span className={styles.featured}>Featured</span>}
        </div>
        <div className={styles.tileType}>{project.type}</div>
        <p className={styles.tileDescription}>{project.description}</p>
        <ul className={styles.tileTags}>
          {project.tags.map((t) => (
            <li key={t}>{SHOWCASE_TAGS[t]}</li>
          ))}
        </ul>
        <div className={styles.tileLinks}>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            Website <IconExternalLink size={10} aria-hidden="true" />
          </a>
          {project.sourceCode && (
            <a href={project.sourceCode} target="_blank" rel="noopener noreferrer">
              Source <IconExternalLink size={10} aria-hidden="true" />
            </a>
          )}
          {project.announcement && (
            <a href={project.announcement} target="_blank" rel="noopener noreferrer">
              Announcement <IconExternalLink size={10} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
};

export default function Showcase(): React.ReactElement {
  const [selected, setSelected] = React.useState<ReadonlySet<ShowcaseTag>>(new Set());
  const visible = PROJECTS.filter((p) => [...selected].every((t) => p.tags.includes(t)));

  const toggle = (tag: ShowcaseTag) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(tag)) next.add(tag);
      return next;
    });

  return (
    <Layout
      title="Showcase"
      description="Lesson platforms, practice apps, editors and plugins built with alphaTab."
    >
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.eyebrow}>§ Showcase</div>
          <h1 className={styles.title}>Built with alphaTab.</h1>
          <p className={styles.lede}>
            Lesson platforms, practice apps, editors and plugins that render and play music with alphaTab.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.ctaPrimary} href={NEW_POST_URL} target="_blank" rel="noopener noreferrer">
              Share your project <IconArrow size={12} aria-hidden="true" />
            </a>
            <a className={styles.ctaSecondary} href={SHOW_AND_TELL_URL} target="_blank" rel="noopener noreferrer">
              Browse Show and tell <IconExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
        </header>

        <div className={styles.filters} role="group" aria-label="Filter projects by tag">
          <button
            type="button"
            className={clsx(styles.filter, selected.size === 0 && styles.filterActive)}
            aria-pressed={selected.size === 0}
            onClick={() => setSelected(new Set())}
          >
            All <span className={styles.filterCount}>{PROJECTS.length}</span>
          </button>
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={clsx(styles.filter, selected.has(t) && styles.filterActive)}
              aria-pressed={selected.has(t)}
              onClick={() => toggle(t)}
            >
              {SHOWCASE_TAGS[t]} <span className={styles.filterCount}>{TAG_COUNTS.get(t)}</span>
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <ul className={styles.grid}>
            {visible.map((p) => (
              <ProjectTile key={p.id} project={p} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No project matches all selected tags.</p>
        )}

        <section className={styles.listing}>
          <h2>Get your project listed</h2>
          <ol>
            <li>
              Post it in{' '}
              <a href={SHOW_AND_TELL_URL} target="_blank" rel="noopener noreferrer">
                Show and tell
              </a>{' '}
              on GitHub: a link, a screenshot and a few words on what it does and how it uses alphaTab.
            </li>
            <li>
              Keep the &ldquo;rendered by alphaTab&rdquo; notice visible, or agree on an alternative credit with us
              in your post.
            </li>
            <li>We pick projects from Show and tell for this page and the landing page, and reply on your post when we do.</li>
          </ol>
        </section>
      </main>
    </Layout>
  );
}
