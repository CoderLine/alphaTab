import React from 'react';
import styles from './mixer.module.scss';

interface Track {
  n: string;
  v: number;
  color: string;
  mute: boolean;
}

const TRACKS: Track[] = [
  { n: 'E-Guitar', v: 0.75, color: 'var(--at-accent)', mute: false },
  { n: 'Bass', v: 0.55, color: 'var(--at-track-purple)', mute: false },
  { n: 'Drums', v: 0, color: 'var(--at-track-green)', mute: true },
];

export const Mixer: React.FC = () => (
  <div className={styles.mixer} aria-hidden="true">
    {TRACKS.map((tr, i) => (
      <div key={i} className={styles.row}>
        <span className={`${styles.name} ${tr.mute ? styles.muted : ''}`}>{tr.n}</span>
        <div className={styles.barTrack}>
          <span
            className={styles.barFill}
            style={{
              width: `${tr.v * 100}%`,
              background: tr.color,
              opacity: tr.mute ? 0.3 : 1,
            }}
          />
        </div>
        <span className={styles.value}>{tr.mute ? 'M' : Math.round(tr.v * 100)}</span>
      </div>
    ))}
  </div>
);
