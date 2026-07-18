'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState } from 'react';
import { TransportControls } from './TransportControls';
import { useAlphaTabEvent } from '@site/src/hooks';
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

export const TrackMixerDemo: React.FC<TrackMixerDemoProps> = ({
  file = '/files/features/Skillet.gp5',
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [tracks, setTracks] = useState<alphaTab.model.Track[]>([]);
  const [state, setState] = useState<Map<number, TrackState>>(new Map());

  useAlphaTabEvent(api, 'scoreLoaded', (score: alphaTab.model.Score) => {
    setTracks(score.tracks);
    const init = new Map<number, TrackState>();
    for (const t of score.tracks) {
      init.set(t.index, { volume: 1, solo: false, mute: false, transpose: 0 });
    }
    setState(init);
  });

  const update = (idx: number, patch: Partial<TrackState>) => {
    setState((prev) => {
      const next = new Map(prev);
      const cur = next.get(idx) ?? { volume: 1, solo: false, mute: false, transpose: 0 };
      const merged = { ...cur, ...patch };
      next.set(idx, merged);
      const track = tracks.find((t) => t.index === idx);
      if (track && api) {
        if (patch.volume !== undefined) api.changeTrackVolume([track], patch.volume);
        if (patch.solo !== undefined) api.changeTrackSolo([track], patch.solo);
        if (patch.mute !== undefined) api.changeTrackMute([track], patch.mute);
        if (patch.transpose !== undefined) {
          api.changeTrackTranspositionPitch([track], patch.transpose);
        }
      }
      return next;
    });
  };

  return (
    <TransportControls
      file={file}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <div style={{ width: '100%' }}>
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
      )}
    />
  );
};
