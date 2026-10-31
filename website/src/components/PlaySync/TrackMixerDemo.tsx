'use client';

import React, { useState, useEffect } from 'react';
import type * as alphaTab from '@coderline/alphatab';
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEventValue,
} from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

interface TrackState {
  volume: number;
  solo: boolean;
  mute: boolean;
  transpose: number;
}

export interface TrackMixerDemoProps {
  file?: string;
  showCode?: boolean;
}

const NO_TRACKS: alphaTab.model.Track[] = [];

const TrackMixer: React.FC = () => {
  const api = useAlphaTabApi();
  const tracks = useAlphaTabEventValue('scoreLoaded', (score) => score.tracks) ?? NO_TRACKS;
  const [state, setState] = useState<Map<number, TrackState>>(new Map());

  // Seed the mixer strip state whenever a new score is loaded.
  useEffect(() => {
    if (tracks.length === 0) { return; }
    setState((prev) => {
      const next = new Map<number, TrackState>();
      for (const t of tracks) {
        next.set(
          t.index,
          prev.get(t.index) ?? { volume: 1, solo: false, mute: false, transpose: 0 },
        );
      }
      return next;
    });
  }, [tracks]);

  const update = (idx: number, patch: Partial<TrackState>) => {
    setState((prev) => {
      const next = new Map(prev);
      const cur = next.get(idx) ?? { volume: 1, solo: false, mute: false, transpose: 0 };
      const merged = { ...cur, ...patch };
      next.set(idx, merged);
      const track = tracks.find((t) => t.index === idx);
      if (track && api) {
        if (patch.volume !== undefined) { api.changeTrackVolume([track], patch.volume); }
        if (patch.solo !== undefined) { api.changeTrackSolo([track], patch.solo); }
        if (patch.mute !== undefined) { api.changeTrackMute([track], patch.mute); }
        if (patch.transpose !== undefined) {
          api.changeTrackTranspositionPitch([track], patch.transpose);
        }
      }
      return next;
    });
  };

  return (
    <div className={styles.extras} style={{ display: 'block' }}>
      {tracks.map((track) => {
        const s = state.get(track.index) ?? {
          volume: 1,
          solo: false,
          mute: false,
          transpose: 0,
        };
        return (
          <div key={track.index} className={styles.mixerRow}>
            <span>{track.name}</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={s.volume}
              onChange={(e) =>
                update(track.index, { volume: parseFloat(e.target.value) })
              }
              aria-label={`Volume for ${track.name}`}
            />
            <button
              className={`${styles.mixerBtn} ${s.solo ? styles.active : ''}`}
              onClick={() => update(track.index, { solo: !s.solo })}
            >
              Solo
            </button>
            <button
              className={`${styles.mixerBtn} ${s.mute ? styles.active : ''}`}
              onClick={() => update(track.index, { mute: !s.mute })}
            >
              Mute
            </button>
            <span className={styles.transposeGroup}>
              <button
                className={styles.mixerBtn}
                onClick={() => update(track.index, { transpose: s.transpose - 1 })}
                aria-label="Transpose down"
              >
                −
              </button>
              <span className={styles.value} style={{ minWidth: '2.5rem', textAlign: 'center' }}>
                {s.transpose > 0 ? `+${s.transpose}` : s.transpose}
              </span>
              <button
                className={styles.mixerBtn}
                onClick={() => update(track.index, { transpose: s.transpose + 1 })}
                aria-label="Transpose up"
              >
                +
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const TrackMixerDemo: React.FC<TrackMixerDemoProps> = ({
  file = '/files/Bach_Prelude_BWV999.gp',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCode = true,
}) => {
  const site = useSiteAlphaTabSettings({ player: true });
  return (
    <div className={styles.wrapper}>
      <AlphaTabProvider
        file={file}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <TransportBar />
        <TrackMixer />
        <AlphaTabHost />
      </AlphaTabProvider>
    </div>
  );
};
