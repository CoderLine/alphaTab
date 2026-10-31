'use client';

import React from 'react';
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface SeekDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const SeekControls: React.FC = () => {
  const api = useAlphaTabApi();
  const [tick, setTick] = React.useState(0);
  const [time, setTime] = React.useState(0);

  useAlphaTabEvent('playerPositionChanged', (e) => {
    setTick(e.currentTick);
    setTime(e.currentTime);
  });

  return (
    <div className={styles.extras}>
      <div className={styles.fieldRow}>
        <button
          className={styles.mixerBtn}
          onClick={() => {
            if (api) { api.tickPosition = 3840; }
          }}
          disabled={!api}
        >
          Jump to tick 3840
        </button>
        <button
          className={styles.mixerBtn}
          onClick={() => {
            if (api) { api.timePosition = 30000; }
          }}
          disabled={!api}
        >
          Jump to 30 s
        </button>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.badge}>tickPosition: {tick}</span>
        <span className={styles.badge}>timePosition: {(time / 1000).toFixed(2)} s</span>
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SeekDemo: React.FC<SeekDemoProps> = ({ file, tex, showCode = true }) => {
  const site = useSiteAlphaTabSettings({ player: true });
  return (
    <div className={styles.wrapper}>
      <AlphaTabProvider
        file={file}
        tex={tex}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <TransportBar />
        <SeekControls />
        <AlphaTabHost />
      </AlphaTabProvider>
    </div>
  );
};
