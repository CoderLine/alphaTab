'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProvider, PlayerHost, usePlayerControls } from '@coderline/alphatab-ui';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface SpeedSliderDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const SpeedSlider: React.FC = () => {
  const controls = usePlayerControls();
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    controls?.setPlaybackSpeed(speed);
  }, [controls, speed]);

  const preset = (v: number) => () => setSpeed(v);

  return (
    <div className={styles.extras}>
      <div className={styles.field}>
        <label htmlFor="speed-range">
          Playback speed: <span className={styles.value}>{speed.toFixed(2)}×</span>
        </label>
        <input
          id="speed-range"
          type="range"
          min={0.25}
          max={2}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          style={{ width: '16rem' }}
        />
      </div>
      <div className={styles.fieldRow}>
        {[0.5, 0.75, 1, 1.25, 1.5].map((v) => (
          <button key={v} className={styles.mixerBtn} onClick={preset(v)}>
            {v}×
          </button>
        ))}
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SpeedSliderDemo: React.FC<SpeedSliderDemoProps> = ({ file, tex, showCode = true }) => (
  <div className={styles.wrapper}>
    <PlayerProvider file={file} tex={tex}>
      <TransportBar />
      <SpeedSlider />
      <PlayerHost />
    </PlayerProvider>
  </div>
);
