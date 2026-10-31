import React from 'react';
import { NotationPreview } from './notation-preview';
import styles from './four-notations.module.scss';

const CELLS = [
  { label: 'Standard staff', kind: 'standard' as const },
  { label: 'Guitar tab', kind: 'tab' as const },
  { label: 'Drum tab', kind: 'drum' as const },
  { label: 'Jiǎnpǔ', kind: 'numbered' as const },
];

export const FourNotations: React.FC = () => (
  <div className={styles.grid}>
    {CELLS.map((c, i) => (
      <div key={i} className={styles.cell}>
        <span className={styles.label}>{c.label}</span>
        <NotationPreview kind={c.kind} />
      </div>
    ))}
  </div>
);
