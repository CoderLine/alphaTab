import React from 'react';
import { IconExternalLink } from '@coderline/alphatab-ui';
import type { ShowcaseStory } from './stories-data';
import styles from './quote-card.module.scss';

interface QuoteCardProps {
  story: Extract<ShowcaseStory, { cardType: 'quote' }>;
  idx: number;
  total: number;
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('');
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ story, idx, total }) => (
  <article className={styles.card} style={{ '--story-accent': story.accent } as React.CSSProperties}>
    <span className={styles.bigQuote} aria-hidden="true">
      “
    </span>

    <div className={styles.eyebrowRow}>
      <span className={styles.eyebrowRule} />
      <span className={styles.eyebrow}>From the community</span>
      <span className={styles.eyebrowSpacer} />
      <span className={styles.counter}>
        {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>

    <blockquote className={styles.quoteWrap}>
      <p className={styles.quote}>“{story.quote}”</p>
    </blockquote>

    <footer className={styles.attribution}>
      <div className={styles.person}>
        <div className={styles.avatar} aria-hidden="true">
          {initials(story.person)}
        </div>
        <div className={styles.personText}>
          <div className={styles.personName}>
            {story.person}
            {story.handle && <span className={styles.handle}>{story.handle}</span>}
          </div>
          <div className={styles.role}>{story.role}</div>
        </div>
      </div>
      <span className={styles.divider} />
      <a className={styles.sourceChip} href={story.source.url} target="_blank" rel="noopener noreferrer">
        <IconExternalLink size={10} aria-hidden="true" /> {story.source.label}
      </a>
    </footer>
  </article>
);
