import React from 'react';
import Link from '@docusaurus/Link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './styles.module.scss';

export type Platform = 'web' | 'net' | 'android';

const PLATFORM_LABEL: Record<Platform, string> = {
  web: 'Web',
  net: '.NET',
  android: 'Android',
};

export type CardAccent =
  | 'sky'
  | 'violet'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'slate';

export interface FeatureCardProps {
  title: string;
  hook?: string;
  link?: string;
  since?: string;
  platforms?: Platform[];
  icon?: IconDefinition;
  accent?: CardAccent;
  visual?: React.ReactNode;
  children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  hook,
  link,
  since,
  platforms,
  icon,
  accent = 'slate',
  visual,
  children,
}) => {
  const media = visual ?? children;
  const hasHeadRow = !!icon;
  const classes = [
    styles.card,
    styles[`accent_${accent}`],
    icon ? styles.cardWithIcon : styles.cardNoIcon,
    media ? styles.cardWithVisual : '',
    link ? styles.cardLink : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {media ? <div className={styles.visual}>{media}</div> : null}
      <div className={styles.body}>
        {hasHeadRow ? (
          <div className={styles.iconBadge} aria-hidden="true">
            <FontAwesomeIcon icon={icon!} />
          </div>
        ) : null}
        <div className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          {since ? <span className={styles.since}>since {since}</span> : null}
        </div>
        {hook ? <p className={styles.hook}>{hook}</p> : null}
        {(platforms && platforms.length < 3) || link ? (
          <div className={styles.footer}>
            {platforms && platforms.length < 3 ? (
              <div className={styles.platforms}>
                {platforms.map((p) => (
                  <span key={p} className={styles.pill}>
                    {PLATFORM_LABEL[p]}
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}
            {link ? (
              <span className={styles.arrow} aria-hidden="true">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (link) {
    return (
      <Link to={link} className={classes}>
        {inner}
      </Link>
    );
  }
  return <div className={classes}>{inner}</div>;
};

export interface FeatureGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  children,
  columns = 3,
}) => {
  return (
    <div
      className={`${styles.grid} ${
        columns === 2 ? styles.grid2 : styles.grid3
      }`}
    >
      {children}
    </div>
  );
};
