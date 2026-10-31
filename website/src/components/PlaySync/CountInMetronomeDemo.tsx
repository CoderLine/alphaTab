'use client';

import React, { useState, useEffect } from 'react';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabModule,
} from '@site/src/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface CountInMetronomeDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

type PlaybackPhase = 'Stopped' | 'Count-in bar' | 'Playing' | 'Paused';

const CountInControls: React.FC = () => {
  const controls = useAlphaTabControls();
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();
  const [countIn, setCountIn] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [phase, setPhase] = useState<PlaybackPhase>('Stopped');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    controls?.setCountInVolume(countIn ? 0.7 : 0);
  }, [controls, countIn]);

  useEffect(() => {
    controls?.setMetronomeVolume(metronome ? 0.7 : 0);
  }, [controls, metronome]);

  useAlphaTabEvent(
    'playerStateChanged',
    (e) => {
      if (!module) { return; }
      const isPlaying = e.state === module.synth.PlayerState.Playing;
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
    if (!controls) { return; }
    controls.stop();
    // Give the player a beat to reset before pressing play again.
    window.setTimeout(() => controls.playPause(), 50);
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
}) => (
  <div className={styles.wrapper}>
    <AlphaTabPlayer file={file} tex={tex}>
      <TransportBar />
      <CountInControls />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  </div>
);
