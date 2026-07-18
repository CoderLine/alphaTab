'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState, useEffect } from 'react';
import { TransportControls } from './TransportControls';
import styles from './styles.module.scss';

export interface SpeedSliderDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

export const SpeedSliderDemo: React.FC<SpeedSliderDemoProps> = ({
  file,
  tex,
  showCode = true,
}) => {
  const [speed, setSpeed] = useState(1);
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();

  useEffect(() => {
    if (api) {
      api.playbackSpeed = speed;
    }
  }, [api, speed]);

  const preset = (v: number) => () => setSpeed(v);

  return (
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <>
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
        </>
      )}
    />
  );
};
