import React from 'react';
import clsx from 'clsx';
import { SectionHeader } from '../section-header';
import { IconArrow } from '../shared/icons';
import { ProjectCard } from './project-card';
import { QuoteCard } from './quote-card';
import { PressCard } from './press-card';
import { useRotation } from './use-rotation';
import { SHOWCASE_STORIES, type ShowcaseStory } from './stories-data';
import styles from './styles.module.scss';

function isProject(s: ShowcaseStory): s is Extract<ShowcaseStory, { cardType: 'project' }> {
  return s.cardType === 'project';
}

const ROTATION_MS = 6000;

export const LandingShowcase: React.FC = () => {
  const [paused, setPaused] = React.useState(false);
  const { idx, setIdx, running, cycle } = useRotation(SHOWCASE_STORIES.length, ROTATION_MS, paused);
  const story = SHOWCASE_STORIES[idx];

  const projects = React.useMemo(() => SHOWCASE_STORIES.filter(isProject), []);
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
      return <QuoteCard story={story} idx={idx} total={SHOWCASE_STORIES.length} />;
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
          paragraph="Practice apps, tab archives, music schools and composer tools ship alphaTab in production. Here's what they — and the people writing about them — say."
          action={
            <a className={styles.seeAll} href="#">
              See all <IconArrow size={12} aria-hidden="true" />
            </a>
          }
        />

        <div
          key={`card-${idx}`}
          className={styles.cardSlot}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {renderCard()}
        </div>

        <div className={styles.switcher} role="tablist" aria-label="Showcase stories">
          {SHOWCASE_STORIES.map((s, i) => {
            const active = i === idx;
            const label =
              s.cardType === 'project' ? s.name : s.cardType === 'press' ? s.publication : s.handle ?? s.person;
            return (
              <button
                key={i}
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
                <span className={styles.chipLabel}>{label}</span>
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
          <span className={styles.legendItem}>
            <span className={styles.legendDot} /> Project
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendQuote}>“</span> Community quote
          </span>
          <span className={styles.legendItem}>¶ Press citation</span>
        </div>
      </div>
    </section>
  );
};
