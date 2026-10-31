'use client';

import React, { useState, useEffect } from 'react';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
} from '@site/src/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface BufferSizeDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const OPTIONS = [
  { value: 100, label: '100 ms (responsive)' },
  { value: 500, label: '500 ms (balanced)' },
  { value: 1500, label: '1500 ms (stable)' },
];

const BufferSizeControls: React.FC = () => {
  const controls = useAlphaTabControls();
  const [buffer, setBuffer] = useState(500);

  useEffect(() => {
    controls?.updateSettings({ player: { bufferTimeInMilliseconds: buffer } });
  }, [controls, buffer]);

  return (
    <div className={styles.extras}>
      <div className={styles.fieldRow}>
        {OPTIONS.map((opt) => (
          <label key={opt.value} className={styles.fieldRow}>
            <input
              type="radio"
              name="buffer-size"
              value={opt.value}
              checked={buffer === opt.value}
              onChange={() => setBuffer(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <span className={styles.badge}>bufferTimeInMilliseconds = {buffer}</span>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BufferSizeDemo: React.FC<BufferSizeDemoProps> = ({ file, tex, showCode = true }) => (
  <div className={styles.wrapper}>
    <AlphaTabPlayer file={file} tex={tex}>
      <TransportBar />
      <BufferSizeControls />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  </div>
);
