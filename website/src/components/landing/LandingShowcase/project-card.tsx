import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { IconArrow } from '../shared/icons';
import { TabNotation } from '../shared/tab-notation';
import { ProjectMark } from './project-mark';
import type { ShowcaseStory } from './stories-data';
import styles from './project-card.module.scss';

interface ProjectCardProps {
  story: Extract<ShowcaseStory, { cardType: 'project' }>;
  projectIdx: number;
  projectTotal: number;
  mirror: boolean;
}

function hostOf(url: string): string {
  return new URL(url).host.replace(/^www\./, '');
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ story, projectIdx, projectTotal, mirror }) => {
  const screenshot = useBaseUrl(story.screenshot ?? '');
  return (
    <article
      className={clsx(styles.card, mirror && styles.mirror)}
      style={{ '--story-accent': story.accent } as React.CSSProperties}
    >
      <span className={styles.topRule} />

      <div className={styles.textCol}>
        <div className={styles.head}>
          <ProjectMark size={44} glyph={story.glyph} accent={story.accent} />
          <div className={styles.headTitles}>
            <div className={styles.name}>{story.name}</div>
            <div className={styles.type}>{story.type}</div>
          </div>
          <span className={styles.headSpacer} />
          <span className={styles.eyebrow}>
            Project · {String(projectIdx + 1).padStart(2, '0')}/{String(projectTotal).padStart(2, '0')}
          </span>
        </div>

        {story.summary !== undefined ? (
          <p className={styles.summary}>{story.summary}</p>
        ) : (
          <blockquote className={styles.quoteWrap}>
            <span className={styles.quoteMark} aria-hidden="true">
              “
            </span>
            <p className={styles.quote}>{story.quote}</p>
          </blockquote>
        )}

        <footer className={styles.attribution}>
          {story.source && (
            <div className={styles.person}>
              <div className={styles.personName}>{story.person ?? story.name}</div>
              <div className={styles.personRole}>
                {story.role && <>{story.role} · </>}
                <a className={styles.sourceLink} href={story.source.url} target="_blank" rel="noopener noreferrer">
                  {story.source.label}
                </a>
              </div>
            </div>
          )}
          {story.stat && (
            <>
              <span className={styles.divider} />
              <div className={styles.stat}>
                <div className={styles.statK}>{story.stat.k}</div>
                <div className={styles.statL}>{story.stat.l}</div>
              </div>
            </>
          )}
          <span className={styles.attrSpacer} />
          <a className={styles.cta} href={story.url} target="_blank" rel="noopener noreferrer">
            Visit project <IconArrow size={11} aria-hidden="true" />
          </a>
        </footer>
      </div>

      <div className={styles.visualCol}>
        <div className={styles.preview}>
          <header className={styles.previewHeader}>
            <span className={styles.previewDot} />
            <span className={styles.previewTitle}>{story.name}</span>
            <span className={styles.previewSpacer} />
            <span className={styles.previewMeta}>{hostOf(story.url)}</span>
          </header>
          {story.screenshot ? (
            <img className={styles.previewShot} src={screenshot} alt={`${story.name} rendering a score with alphaTab`} loading="lazy" />
          ) : (
            <div className={styles.previewNotation}>
              <TabNotation width={420} height={140} measures={3} cursor={0.42} decorative />
            </div>
          )}
          <footer className={styles.previewFooter}>
            <span>{story.meta}</span>
          </footer>
        </div>
      </div>
    </article>
  );
};
