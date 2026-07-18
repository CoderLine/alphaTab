'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState, useEffect } from 'react';
import { TransportControls } from './TransportControls';
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

export const BufferSizeDemo: React.FC<BufferSizeDemoProps> = ({
  file,
  tex,
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [buffer, setBuffer] = useState(500);

  useEffect(() => {
    if (!api) return;
    api.settings.player.bufferTimeInMilliseconds = buffer;
    api.updateSettings();
  }, [api, buffer]);

  return (
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <>
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
        </>
      )}
    />
  );
};
