import React from 'react';
import styles from './platforms.module.scss';

const PLATFORMS = [
  { p: 'JavaScript', v: 'npm i @coderline/alphatab', stable: true },
  { p: '.NET', v: 'dotnet add AlphaTab', stable: true },
  { p: 'Kotlin', v: 'implementation alphaTab', stable: true },
  { p: 'iOS', v: 'in progress', stable: false },
];

export const Platforms: React.FC = () => (
  <div className={styles.list} aria-hidden="true">
    {PLATFORMS.map((p, i) => (
      <div key={i} className={styles.row}>
        <span className={`${styles.dot} ${p.stable ? styles.dotStable : ''}`} />
        <span className={styles.name}>{p.p}</span>
        <span className={styles.value}>{p.v}</span>
      </div>
    ))}
  </div>
);
