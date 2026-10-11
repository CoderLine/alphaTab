import React from 'react';
import clsx from 'clsx';
import styles from './segmented.module.scss';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
  /** Accessible name of the group. */
  label?: string;
}

export function Segmented<T extends string>({ value, onChange, options, label }: SegmentedProps<T>) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={clsx(styles.segmentBtn, value === o.v && styles.segmentBtnActive)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
