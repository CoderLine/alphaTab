'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState } from 'react';
import { TransportControls } from './TransportControls';
import { useAlphaTabEvent } from '@site/src/hooks';
import styles from './styles.module.scss';

export interface SeekDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

export const SeekDemo: React.FC<SeekDemoProps> = ({
  file,
  tex,
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(0);

  useAlphaTabEvent(api, 'playerPositionChanged', (e: alphaTab.synth.PositionChangedEventArgs) => {
    setTick(e.currentTick);
    setTime(e.currentTime);
  });

  return (
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <>
          <div className={styles.fieldRow}>
            <button
              className={styles.mixerBtn}
              onClick={() => {
                if (api) api.tickPosition = 3840;
              }}
            >
              Jump to tick 3840
            </button>
            <button
              className={styles.mixerBtn}
              onClick={() => {
                if (api) api.timePosition = 30000;
              }}
            >
              Jump to 30 s
            </button>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.badge}>tickPosition: {tick}</span>
            <span className={styles.badge}>timePosition: {(time / 1000).toFixed(2)} s</span>
          </div>
        </>
      )}
    />
  );
};
