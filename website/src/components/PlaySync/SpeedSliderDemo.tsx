'use client';

import React, { useState, useEffect } from 'react';
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface SpeedSliderDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const SpeedSlider: React.FC = () => {
  const api = useAlphaTabApi();
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (api) { api.playbackSpeed = speed; }
  }, [api, speed]);

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
export const SpeedSliderDemo: React.FC<SpeedSliderDemoProps> = ({ file, tex, showCode = true }) => {
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
        <SpeedSlider />
        <AlphaTabHost />
      </AlphaTabProvider>
    </div>
  );
};
