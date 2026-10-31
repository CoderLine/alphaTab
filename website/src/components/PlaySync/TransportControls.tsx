'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import CodeBlock from '@theme/CodeBlock';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
  useAlphaTabState,
  type AlphaTabPlayerProps,
} from '@site/src/alphatab-react';
import styles from './styles.module.scss';

export interface TransportControlsProps {
  /** URL of a score file to load. Mutually exclusive with `tex`. */
  file?: string;
  /** Inline alphaTex source to load. Mutually exclusive with `file`. */
  tex?: string;
  settings?: AlphaTabPlayerProps['settings'];
  tracks?: AlphaTabPlayerProps['tracks'];
  /** Render a copy-pasteable code block below the demo. Defaults to `true`. */
  showCode?: boolean;
  /** Optional custom TypeScript snippet shown when `showCode` is true. */
  codeSample?: string;
  /**
   * Additional consumer components rendered inside the alphaTab provider,
   * between the transport bar and the score. Use hooks from
   * `@site/src/alphatab-react` to react to state.
   */
  children?: React.ReactNode;
}

const formatDuration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Standalone transport strip — Play/Pause, Stop, time readout, progress bar.
 * Must be rendered inside an `<AlphaTabPlayer>`. Exposed so demos that layer
 * their own chrome on top of the transport can compose it as a sibling.
 */
export const TransportBar: React.FC = () => {
  const controls = useAlphaTabControls();
  const { isPlaying, currentTime, endTime } = useAlphaTabState();
  const safeEnd = endTime > 0 ? endTime : 1;
  const progress = (currentTime / safeEnd) * 100;

  return (
    <div className={styles.transport}>
      <div className={styles.transportButtons}>
        <button
          className={styles.iconButton}
          onClick={() => controls?.playPause()}
          disabled={!controls}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
        </button>
        <button
          className={styles.iconButton}
          onClick={() => controls?.stop()}
          disabled={!controls}
          aria-label="Stop"
          title="Stop"
        >
          <FontAwesomeIcon icon={solid.faStop} />
        </button>
      </div>
      <div className={styles.timeReadout}>
        {formatDuration(currentTime)} / {formatDuration(safeEnd)}
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress.toFixed(2)}%` }} />
      </div>
    </div>
  );
};

/**
 * Thin `AlphaTabPlayer` wrapper that lays down the standard demo chrome:
 * transport bar on top, the score below, an optional code block at the
 * bottom. Additional consumer components can be composed via `children` —
 * they render between the transport bar and the score.
 */
export const TransportControls: React.FC<TransportControlsProps> = ({
  file,
  tex,
  settings,
  tracks,
  showCode = true,
  codeSample,
  children,
}) => {
  if (file && tex) {
    throw new Error('TransportControls: pass either `file` or `tex`, not both.');
  }

  return (
    <div className={styles.wrapper}>
      <AlphaTabPlayer file={file} tex={tex} tracks={tracks} settings={settings}>
        <TransportBar />
        {children}
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode && codeSample && (
        <CodeBlock language="typescript" title="TypeScript Code for this sample">
          {codeSample}
        </CodeBlock>
      )}
    </div>
  );
};
