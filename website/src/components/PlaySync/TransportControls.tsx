'use client';

import React from 'react';
import * as alphaTab from '@coderline/alphatab';
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEventValue,
} from '@coderline/alphatab-react';
import { formatTime, IconPause, IconPlay, IconStop } from '@coderline/alphatab-ui';
import CodeBlock from '@theme/CodeBlock';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import styles from './styles.module.scss';

export interface TransportControlsProps {
  /** URL of a score file to load. Mutually exclusive with `tex`. */
  file?: string;
  /** Inline alphaTex source to load. Mutually exclusive with `file`. */
  tex?: string;
  settings?: alphaTab.json.SettingsJson;
  tracks?: number[] | 'all';
  /** Render a copy-pasteable code block below the demo. Defaults to `true`. */
  showCode?: boolean;
  /** Optional custom TypeScript snippet shown when `showCode` is true. */
  codeSample?: string;
  /**
   * Additional consumer components rendered inside the alphaTab provider,
   * between the transport bar and the score. Use the hooks of
   * `@coderline/alphatab-react` to reach the API.
   */
  children?: React.ReactNode;
}

/**
 * Standalone transport strip — Play/Pause, Stop, time readout, progress bar.
 * Must be rendered inside an `<AlphaTabProvider>`. Exposed so demos that layer
 * their own chrome on top of the transport can compose it as a sibling.
 */
export const TransportBar: React.FC = () => {
  const api = useAlphaTabApi();
  const isReady =
    useAlphaTabEventValue('playerReady', () => true, (a) => a.isReadyForPlayback) ?? false;
  const isPlaying =
    useAlphaTabEventValue(
      'playerStateChanged',
      (e) => e.state === alphaTab.synth.PlayerState.Playing,
    ) ?? false;
  const position = useAlphaTabEventValue('playerPositionChanged', (e) => e);
  const currentTime = position?.currentTime ?? 0;
  const safeEnd = position && position.endTime > 0 ? position.endTime : 1;
  const progress = (currentTime / safeEnd) * 100;

  return (
    <div className={styles.transport}>
      <div className={styles.transportButtons}>
        <button
          className={styles.iconButton}
          onClick={() => api?.playPause()}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
        </button>
        <button
          className={styles.iconButton}
          onClick={() => api?.stop()}
          disabled={!isReady}
          aria-label="Stop"
          title="Stop"
        >
          <IconStop aria-hidden="true" />
        </button>
      </div>
      <div className={styles.timeReadout}>
        {formatTime(currentTime)} / {formatTime(safeEnd)}
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress.toFixed(2)}%` }} />
      </div>
    </div>
  );
};

/**
 * Lays down the standard demo chrome around an `AlphaTabProvider`:
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
  const site = useSiteAlphaTabSettings({ player: true, settings });

  return (
    <div className={styles.wrapper}>
      <AlphaTabProvider
        file={file}
        tex={tex}
        tracks={tracks}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <TransportBar />
        {children}
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode && codeSample && (
        <CodeBlock language="typescript" title="TypeScript Code for this sample">
          {codeSample}
        </CodeBlock>
      )}
    </div>
  );
};
