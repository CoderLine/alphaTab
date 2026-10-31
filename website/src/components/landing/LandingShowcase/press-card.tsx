import React from 'react';
import { IconExternalLink } from '@coderline/alphatab-ui';
import type { ShowcaseStory } from './stories-data';
import styles from './press-card.module.scss';

interface PressCardProps {
  story: Extract<ShowcaseStory, { cardType: 'press' }>;
}

export const PressCard: React.FC<PressCardProps> = ({ story }) => (
  <article className={styles.card} style={{ '--story-accent': story.accent } as React.CSSProperties}>
    <span className={styles.topRule} />
    <span className={styles.topRuleThin} />

    <div className={styles.dateStrip}>
      <span className={styles.dateLabel}>{story.kind === 'research' ? '¶ In research' : '¶ In the press'}</span>
      <span>·</span>
      <span>{story.date}</span>
      <span className={styles.dateLine} />
    </div>

    <div className={styles.nameplate}>{story.publication}</div>

    <div className={styles.body}>
      <div className={styles.dropCap} aria-hidden="true">
        “
      </div>
      <div className={styles.bodyContent}>
        <p className={styles.quote}>{story.quote}</p>

        <div className={styles.sourceRow}>
          <span className={styles.sourceLabel}>{story.byline}</span>
          <span className={styles.sourceSpacer} />
          <a className={styles.cta} href={story.url} target="_blank" rel="noopener noreferrer">
            {story.kind === 'research' ? 'Read the paper' : 'Read the article'} <IconExternalLink size={11} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>

    <span className={styles.cornerMark} aria-hidden="true" />
  </article>
);
