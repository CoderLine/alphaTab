import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { SectionHeader } from '../section-header';
import { IconArrow } from '../shared/icons';
import { ProjectCard } from './project-card';
import { QuoteCard } from './quote-card';
import { PressCard } from './press-card';
import { useRotation } from './use-rotation';
import { SHOWCASE_SLOTS, SHOWCASE_STORIES, arrangeStories, type ShowcaseStory } from './stories-data';
import styles from './styles.module.scss';

function isProject(s: ShowcaseStory): s is Extract<ShowcaseStory, { cardType: 'project' }> {
  return s.cardType === 'project';
}

const ROTATION_MS = 6000;
const POOL_TYPES = new Set(SHOWCASE_STORIES.map((s) => s.cardType));

export const LandingShowcase: React.FC = () => {
  const [paused, setPaused] = React.useState(false);
  // Shuffled only after hydration so the server-rendered markup matches the first client render.
  const [stories, setStories] = React.useState(() => arrangeStories(SHOWCASE_STORIES, SHOWCASE_SLOTS));
  React.useEffect(() => setStories(arrangeStories(SHOWCASE_STORIES, SHOWCASE_SLOTS, Math.random)), []);

  const { idx, setIdx, running, cycle } = useRotation(stories.length, ROTATION_MS, paused);
  const story = stories[idx];

  const projects = React.useMemo(() => stories.filter(isProject), [stories]);
  const projectIdx = projects.indexOf(story as Extract<ShowcaseStory, { cardType: 'project' }>);

  const renderCard = () => {
    if (story.cardType === 'project') {
      return (
        <ProjectCard
          story={story}
          projectIdx={projectIdx}
          projectTotal={projects.length}
          mirror={projectIdx % 2 === 1}
        />
      );
    }
    if (story.cardType === 'quote') {
      return <QuoteCard story={story} idx={idx} total={stories.length} />;
    }
    return <PressCard story={story} />;
  };

  const onFocus = React.useCallback(() => setPaused(true), []);
  const onBlur = React.useCallback(() => setPaused(false), []);
  const onEnter = React.useCallback(() => setPaused(true), []);
  const onLeave = React.useCallback(() => setPaused(false), []);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="§ Showcase"
          title="Built with alphaTab."
          paragraph="Practice apps, tab editors, Obsidian plugins and drum trainers run on alphaTab. Here's what their builders — and the developers recommending it — say."
          action={
            <Link className={styles.seeAll} to="/showcase">
              See all <IconArrow size={12} aria-hidden="true" />
            </Link>
          }
        />

        <div
          key={story.id}
          className={styles.cardSlot}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {renderCard()}
        </div>

        <div
          className={styles.switcher}
          role="tablist"
          aria-label="Showcase stories"
          style={{ '--chip-count': stories.length } as React.CSSProperties}
        >
          {stories.map((s, i) => {
            const active = i === idx;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setIdx(i)}
                className={clsx(styles.chip, active && styles.chipActive)}
                style={{ '--story-accent': s.accent } as React.CSSProperties}
              >
                <span className={styles.chipIcon} data-kind={s.cardType} aria-hidden="true">
                  {s.cardType === 'project' && <span className={styles.chipDot} />}
                  {s.cardType === 'press' && '¶'}
                  {s.cardType === 'quote' && '“'}
                </span>
                <span className={styles.chipLabel}>{s.chip}</span>
                {active && (
                  <span
                    key={cycle}
                    className={styles.chipProgress}
                    data-running={running ? 'true' : 'false'}
                    style={{ animationDuration: `${ROTATION_MS}ms` } as React.CSSProperties}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.legend}>
          {POOL_TYPES.has('project') && (
            <span className={styles.legendItem}>
              <span className={styles.legendDot} /> Project
            </span>
          )}
          {POOL_TYPES.has('quote') && (
            <span className={styles.legendItem}>
              <span className={styles.legendQuote}>“</span> Community quote
            </span>
          )}
          {POOL_TYPES.has('press') && <span className={styles.legendItem}>¶ Research &amp; press</span>}
        </div>
      </div>
    </section>
  );
};
