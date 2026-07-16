import React from 'react';
import clsx from 'clsx';
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

export const ProjectCard: React.FC<ProjectCardProps> = ({ story, projectIdx, projectTotal, mirror }) => (
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
          Case study · {String(projectIdx + 1).padStart(2, '0')}/{String(projectTotal).padStart(2, '0')}
        </span>
      </div>

      <blockquote className={styles.quoteWrap}>
        <span className={styles.quoteMark} aria-hidden="true">
          “
        </span>
        <p className={styles.quote}>{story.quote}</p>
      </blockquote>

      <footer className={styles.attribution}>
        <div className={styles.person}>
          <div className={styles.personName}>{story.person}</div>
          <div className={styles.personRole}>
            {story.role} · {story.name}
          </div>
        </div>
        <span className={styles.divider} />
        <div className={styles.stat}>
          <div className={styles.statK}>{story.stat.k}</div>
          <div className={styles.statL}>{story.stat.l}</div>
        </div>
        <span className={styles.attrSpacer} />
        <a className={styles.cta} href="#">
          Read case study <IconArrow size={11} aria-hidden="true" />
        </a>
      </footer>
    </div>

    <div className={styles.visualCol}>
      <div className={styles.preview}>
        <header className={styles.previewHeader}>
          <span className={styles.previewDot} />
          <span className={styles.previewTitle}>{story.name}</span>
          <span className={styles.previewMeta}>
            · {story.sample.key} · ♩ = {story.sample.tempo}
          </span>
          <span className={styles.previewSpacer} />
          <span className={styles.previewTuning}>{story.sample.tuning}</span>
        </header>
        <div className={styles.previewNotation}>
          <TabNotation width={420} height={140} measures={3} cursor={0.42} decorative />
        </div>
        <footer className={styles.previewFooter}>
          <span className={styles.previewPlay}>
            <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true">
              <path d="M1 0v6l5-3z" fill="currentColor" />
            </svg>
          </span>
          <span>01:24 / 03:48</span>
          <span className={styles.previewSpacer} />
          <span className={styles.previewMeta}>{story.type.toLowerCase()}</span>
        </footer>
      </div>
    </div>
  </article>
);
