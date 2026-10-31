import React from 'react';
import styles from './styles.module.scss';

export type Platform = 'web' | 'net' | 'android';

const LABELS: Record<Platform, string> = {
  web: 'Web',
  net: '.NET',
  android: 'Android',
};

export interface PlatformBadgesProps {
  platforms?: Platform[];
  children?: React.ReactNode;
}

export const PlatformBadges: React.FC<PlatformBadgesProps> = ({
  platforms = ['web', 'net', 'android'],
  children,
}) => {
  return (
    <div className={styles.wrap} role="note" aria-label="Platform availability">
      <div className={styles.row}>
        <span className={styles.label}>Available on</span>
        {platforms.map((p) => (
          <span key={p} className={`badge badge--secondary ${styles.pill}`}>
            {LABELS[p]}
          </span>
        ))}
      </div>
      {children ? <div className={styles.caption}>{children}</div> : null}
    </div>
  );
};
