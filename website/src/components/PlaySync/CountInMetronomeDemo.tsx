'use client';

import React, { useState, useEffect } from 'react';
import * as alphaTab from '@coderline/alphatab';
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface CountInMetronomeDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

type PlaybackPhase = 'Stopped' | 'Count-in bar' | 'Playing' | 'Paused';

const CountInControls: React.FC = () => {
  const api = useAlphaTabApi();
  const [countIn, setCountIn] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [phase, setPhase] = useState<PlaybackPhase>('Stopped');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (api) { api.countInVolume = countIn ? 0.7 : 0; }
  }, [api, countIn]);

  useEffect(() => {
    if (api) { api.metronomeVolume = metronome ? 0.7 : 0; }
  }, [api, metronome]);

  useAlphaTabEvent(
    'playerStateChanged',
    (e) => {
      const isPlaying = e.state === alphaTab.synth.PlayerState.Playing;
      setPlaying(isPlaying);
      if (e.stopped) {
        setPhase('Stopped');
      } else if (!isPlaying) {
        setPhase('Paused');
      }
    },
  );

  // A negative currentTick means the count-in bar is currently playing.
  useAlphaTabEvent(
    'playerPositionChanged',
    (e) => {
      if (playing) {
        setPhase(e.currentTick < 0 ? 'Count-in bar' : 'Playing');
      }
    },
  );

  const restart = () => {
    if (!api) { return; }
    api.stop();
    // Give the player a beat to reset before pressing play again.
    window.setTimeout(() => api.playPause(), 50);
  };

  return (
    <div className={styles.extras}>
      <label className={styles.fieldRow}>
        <input
          type="checkbox"
          checked={countIn}
          onChange={(e) => setCountIn(e.target.checked)}
        />
        One-bar count-in
      </label>
      <label className={styles.fieldRow}>
        <input
          type="checkbox"
          checked={metronome}
          onChange={(e) => setMetronome(e.target.checked)}
        />
        Metronome during playback
      </label>
      <button className={styles.mixerBtn} onClick={restart} disabled={!api}>
        Restart from top
      </button>
      <span className={styles.badge}>Playback state: {phase}</span>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CountInMetronomeDemo: React.FC<CountInMetronomeDemoProps> = ({
  file,
  tex,
  showCode = true,
}) => {
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
        <CountInControls />
        <AlphaTabHost />
      </AlphaTabProvider>
    </div>
  );
};
