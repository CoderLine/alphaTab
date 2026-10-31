import React from 'react';
import styles from './logo.module.scss';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 22, className }) => {
  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(' ')}
      style={{ '--logo-size': `${size}px`, '--logo-text-size': `${size * 0.82}px` } as React.CSSProperties}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 4v11.2" stroke="var(--at-accent)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 4c3.6.6 6 2.6 6 5.4" stroke="var(--at-accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <ellipse cx="6.6" cy="16" rx="3.4" ry="2.6" transform="rotate(-18 6.6 16)" fill="var(--at-accent)" />
      </svg>
      <span className={styles.wordmark}>
        <span className={styles.alpha}>alpha</span>
        <span>Tab</span>
      </span>
    </span>
  );
};
