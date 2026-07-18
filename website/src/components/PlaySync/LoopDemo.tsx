'use client';

import React, { useState, useEffect } from 'react';
import type * as alphaTab from '@coderline/alphatab';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
  useAlphaTabApi,
  useAlphaTabEvent,
} from '@site/src/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface LoopDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

interface RangeReadout {
  startTick: number;
  endTick: number;
  startBarLabel: number | null;
  endBarLabel: number | null;
  source: 'controls' | 'drag';
}

const firstBeatOfBar = (
  score: alphaTab.model.Score,
  barIndex: number,
): alphaTab.model.Beat | null => {
  for (const track of score.tracks) {
    const bar = track.staves[0]?.bars[barIndex];
    const beat = bar?.voices[0]?.beats[0];
    if (beat) return beat;
  }
  return null;
};

const lastBeatOfBar = (
  score: alphaTab.model.Score,
  barIndex: number,
): alphaTab.model.Beat | null => {
  for (const track of score.tracks) {
    const bar = track.staves[0]?.bars[barIndex];
    const beats = bar?.voices[0]?.beats;
    if (beats && beats.length > 0) return beats[beats.length - 1];
  }
  return null;
};

const LoopControls: React.FC = () => {
  const controls = useAlphaTabControls();
  const api = useAlphaTabApi();
  const [barCount, setBarCount] = useState(0);
  const [startBar, setStartBar] = useState(2);
  const [endBar, setEndBar] = useState(5);
  const [isLooping, setIsLooping] = useState(true);
  const [range, setRange] = useState<RangeReadout | null>(null);

  useAlphaTabEvent('scoreLoaded', (score) => {
    setBarCount(score.masterBars.length);
    const maxIndex = score.masterBars.length - 1;
    setStartBar((v) => Math.min(v, maxIndex));
    setEndBar((v) => Math.min(v, maxIndex));
  });

  // Apply the range from the bar dropdowns AND paint the highlight overlay so
  // the pre-configured loop is visible on the score from the first render.
  useEffect(() => {
    if (!api || !api.score || barCount === 0) return;
    const s = Math.max(0, Math.min(startBar, barCount - 1));
    const e = Math.max(s, Math.min(endBar, barCount - 1));
    const startTick = api.score.masterBars[s].start;
    const endMb = api.score.masterBars[e];
    const endTick = endMb.start + endMb.calculateDuration();
    api.playbackRange = { startTick, endTick } as alphaTab.synth.PlaybackRange;
    const startBeat = firstBeatOfBar(api.score, s);
    const endBeat = lastBeatOfBar(api.score, e);
    if (startBeat && endBeat) {
      api.highlightPlaybackRange(startBeat, endBeat);
    }
    setRange({
      startTick,
      endTick,
      startBarLabel: s + 1,
      endBarLabel: e + 1,
      source: 'controls',
    });
  }, [api, startBar, endBar, barCount]);

  useEffect(() => {
    controls?.setLoopPlayback(isLooping);
  }, [controls, isLooping]);

  // Reflect user-driven range drags in the info panel and the bar dropdowns.
  useAlphaTabEvent('playbackRangeHighlightChanged', (e) => {
    const startBeat = e.startBeat;
    const endBeat = e.endBeat;
    if (!startBeat || !endBeat || !api?.tickCache) return;
    const startTick = api.tickCache.getBeatStart(startBeat);
    const endTick = api.tickCache.getBeatStart(endBeat);
    const startBarIndex = startBeat.voice.bar.index;
    const endBarIndex = endBeat.voice.bar.index;
    setRange({
      startTick,
      endTick,
      startBarLabel: startBarIndex + 1,
      endBarLabel: endBarIndex + 1,
      source: 'drag',
    });
  });

  const barOptions = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className={styles.extras}>
      <div className={styles.fieldRow}>
        <label>
          Start bar:{' '}
          <select
            value={startBar}
            onChange={(e) => setStartBar(parseInt(e.target.value, 10))}
          >
            {barOptions.map((i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          End bar:{' '}
          <select
            value={endBar}
            onChange={(e) => setEndBar(parseInt(e.target.value, 10))}
          >
            {barOptions.map((i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.fieldRow}>
          <input
            type="checkbox"
            checked={isLooping}
            onChange={(e) => setIsLooping(e.target.checked)}
          />
          Loop
        </label>
      </div>
      {range && (
        <span className={styles.badge}>
          playbackRange: bars {range.startBarLabel ?? startBar + 1}–
          {range.endBarLabel ?? endBar + 1} (ticks {range.startTick}–{range.endTick})
          {range.source === 'drag' && ' — from drag'}
        </span>
      )}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LoopDemo: React.FC<LoopDemoProps> = ({ file, tex, showCode = true }) => (
  <div className={styles.wrapper}>
    <AlphaTabPlayer file={file} tex={tex}>
      <TransportBar />
      <LoopControls />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  </div>
);
