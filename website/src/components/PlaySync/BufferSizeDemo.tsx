'use client';

import React, { useState } from 'react';
import { AlphaTabHost, AlphaTabProvider } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
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

const BufferSizeControls: React.FC<{
  buffer: number;
  onChange: (buffer: number) => void;
}> = ({ buffer, onChange: setBuffer }) => {
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
export const BufferSizeDemo: React.FC<BufferSizeDemoProps> = ({ file, tex, showCode = true }) => {
  const [buffer, setBuffer] = useState(500);
  const site = useSiteAlphaTabSettings({
    player: true,
    settings: { player: { bufferTimeInMilliseconds: buffer } },
  });
  return (
    <div className={styles.wrapper}>
      <AlphaTabProvider
        file={file}
        tex={tex}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <TransportBar />
        <BufferSizeControls buffer={buffer} onChange={setBuffer} />
        <AlphaTabHost />
      </AlphaTabProvider>
    </div>
  );
};
