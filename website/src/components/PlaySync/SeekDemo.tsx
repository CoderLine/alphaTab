'use client';

import React from 'react';
import { PlayerProvider, PlayerHost, usePlayerControls } from '@coderline/alphatab-ui';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface SeekDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const SeekControls: React.FC = () => {
  const controls = usePlayerControls();
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
          onClick={() => controls?.seekToTick(3840)}
          disabled={!api}
        >
          Jump to tick 3840
        </button>
        <button
          className={styles.mixerBtn}
          onClick={() => controls?.seekToTime(30000)}
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
export const SeekDemo: React.FC<SeekDemoProps> = ({ file, tex, showCode = true }) => (
  <div className={styles.wrapper}>
    <PlayerProvider file={file} tex={tex}>
      <TransportBar />
      <SeekControls />
      <PlayerHost />
    </PlayerProvider>
  </div>
);
