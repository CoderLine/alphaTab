'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { useAlphaTab, useAlphaTabEvent } from '@site/src/hooks';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.scss';

export interface TransportControlsProps {
  /** URL of a score file to load. Mutually exclusive with `tex`. */
  file?: string;
  /** Inline alphaTex source to load. Mutually exclusive with `file`. */
  tex?: string;
  settings?: alphaTab.json.SettingsJson;
  tracks?: number[] | 'all';
  renderExtras?: (api: alphaTab.AlphaTabApi | undefined) => React.ReactNode;
  onApi?: (api: alphaTab.AlphaTabApi) => void;
  /** Render a copy-pasteable code block below the demo. Defaults to `true`. */
  showCode?: boolean;
  /** Optional custom TypeScript snippet shown when `showCode` is true. */
  codeSample?: string;
  children?: React.ReactNode;
}

const formatDuration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const TransportControls: React.FC<TransportControlsProps> = ({
  file,
  tex,
  settings,
  tracks,
  renderExtras,
  onApi,
  showCode = true,
  codeSample,
  children,
}) => {
  if (file && tex) {
    throw new Error(
      'TransportControls: pass either `file` or `tex`, not both.'
    );
  }

  const [api, element] = useAlphaTab((s) => {
    if (file) {
      s.core.file = file;
    }
    if (tex) {
      s.core.tex = true;
    }
    if (tracks) {
      s.core.tracks = tracks;
    }
    s.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
    s.player.scrollOffsetY = -50;
    s.player.scrollMode = alphaTab.ScrollMode.Off;
    if (settings) {
      s.fillFromJson(settings);
    }
  });

  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [endTime, setEndTime] = useState(1);

  useAlphaTabEvent(api, 'playerStateChanged', (e: alphaTab.synth.PlayerStateChangedEventArgs) => {
    setPlaying(e.state === alphaTab.synth.PlayerState.Playing);
  });

  useAlphaTabEvent(api, 'playerPositionChanged', (e: alphaTab.synth.PositionChangedEventArgs) => {
    setCurrentTime(e.currentTime);
    setEndTime(e.endTime || 1);
  });

  React.useEffect(() => {
    if (api && onApi) {
      onApi(api);
    }
  }, [api, onApi]);

  const progress = endTime > 0 ? (currentTime / endTime) * 100 : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.transport}>
        <div className={styles.transportButtons}>
          <button
            className={styles.iconButton}
            onClick={() => api?.playPause()}
            disabled={!api}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => api?.stop()}
            disabled={!api}
            aria-label="Stop"
            title="Stop"
          >
            <FontAwesomeIcon icon={solid.faStop} />
          </button>
        </div>
        <div className={styles.timeReadout}>
          {formatDuration(currentTime)} / {formatDuration(endTime)}
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress.toFixed(2)}%` }} />
        </div>
      </div>
      {renderExtras && <div className={styles.extras}>{renderExtras(api)}</div>}
      <div ref={element}>{tex ? tex : children}</div>
      {showCode && codeSample && (
        <CodeBlock language="typescript" title="TypeScript Code for this sample">
          {codeSample}
        </CodeBlock>
      )}
    </div>
  );
};
