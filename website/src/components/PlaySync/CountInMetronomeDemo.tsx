'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState, useEffect } from 'react';
import { TransportControls } from './TransportControls';
import { useAlphaTabEvent } from '@site/src/hooks';
import styles from './styles.module.scss';

export interface CountInMetronomeDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

type PlaybackPhase = 'Stopped' | 'Count-in bar' | 'Playing' | 'Paused';

export const CountInMetronomeDemo: React.FC<CountInMetronomeDemoProps> = ({
  file,
  tex,
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [countIn, setCountIn] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [phase, setPhase] = useState<PlaybackPhase>('Stopped');
  const [playerState, setPlayerState] = useState<alphaTab.synth.PlayerState>(
    alphaTab.synth.PlayerState.Paused,
  );

  useEffect(() => {
    if (api) api.countInVolume = countIn ? 0.7 : 0;
  }, [api, countIn]);

  useEffect(() => {
    if (api) api.metronomeVolume = metronome ? 0.7 : 0;
  }, [api, metronome]);

  useAlphaTabEvent(
    api,
    'playerStateChanged',
    (e: alphaTab.synth.PlayerStateChangedEventArgs) => {
      setPlayerState(e.state);
      if (e.stopped) {
        setPhase('Stopped');
      } else if (e.state === alphaTab.synth.PlayerState.Paused) {
        setPhase('Paused');
      }
    },
  );

  // A negative currentTick means the count-in bar is currently playing.
  useAlphaTabEvent(
    api,
    'playerPositionChanged',
    (e: alphaTab.synth.PositionChangedEventArgs) => {
      if (playerState === alphaTab.synth.PlayerState.Playing) {
        setPhase(e.currentTick < 0 ? 'Count-in bar' : 'Playing');
      }
    },
    [playerState],
  );

  const restart = () => {
    if (!api) return;
    api.stop();
    // Give the player a beat to reset before pressing play again.
    window.setTimeout(() => api.playPause(), 50);
  };

  return (
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <>
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
          <button
            className={styles.mixerBtn}
            onClick={restart}
            disabled={!api}
          >
            Restart from top
          </button>
          <span className={styles.badge}>Playback state: {phase}</span>
        </>
      )}
    />
  );
};
