import React from 'react';
import clsx from 'clsx';
import styles from './pill.module.scss';

interface PillProps {
  children: React.ReactNode;
  mono?: boolean;
  tone?: 'neutral' | 'accent';
  className?: string;
}

export const Pill: React.FC<PillProps> = ({ children, mono = true, tone = 'neutral', className }) => {
  return (
    <span className={clsx(styles.pill, mono && styles.mono, tone === 'accent' && styles.accent, className)}>
      {children}
    </span>
  );
};
