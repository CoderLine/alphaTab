import React from 'react';
import styles from './section-header.module.scss';

interface SectionHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  paragraph?: React.ReactNode;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, paragraph, action, meta }) => {
  const corner = action ?? (meta ? <span className={styles.meta}>{meta}</span> : null);
  return (
    <div className={styles.header}>
      <div className={styles.eyebrowRow}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        {corner}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {paragraph && <p className={styles.lede}>{paragraph}</p>}
    </div>
  );
};
