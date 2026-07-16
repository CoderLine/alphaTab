import React from 'react';
import styles from './reflow.module.scss';

const SIZES = [
  { w: 60, h: 80, label: 'sm' },
  { w: 100, h: 90, label: 'md' },
  { w: 160, h: 100, label: 'lg' },
];

export const Reflow: React.FC = () => (
  <div className={styles.row} aria-hidden="true">
    {SIZES.map((b, i) => (
      <div key={i} className={styles.frame} style={{ width: b.w, height: b.h }}>
        <div className={styles.lines}>
          {Array.from({ length: 4 }).map((_, j) => (
            <span key={j} className={styles.line} />
          ))}
        </div>
        <div className={styles.label}>{b.label}</div>
      </div>
    ))}
  </div>
);
