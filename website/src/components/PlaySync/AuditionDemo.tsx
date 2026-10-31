'use client';

import React, { useState } from 'react';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
} from '@site/src/alphatab-react';
import styles from './styles.module.scss';

export interface AuditionDemoProps {
  file?: string;
  showCode?: boolean;
}

const AuditionControls: React.FC = () => {
  const api = useAlphaTabApi();
  const [lastLabel, setLastLabel] = useState('nothing yet');

  useAlphaTabEvent('beatMouseDown', (beat) => {
    api?.playBeat(beat);
    const barIndex = beat.voice.bar.index + 1;
    const beatIndex = beat.index + 1;
    setLastLabel(`beat @ bar ${barIndex} beat ${beatIndex}`);
  });

  useAlphaTabEvent('noteMouseDown', (note) => {
    // noteMouseDown fires alongside beatMouseDown — only audition the single note when it's a chord
    if (note.beat.notes.length > 1) {
      api?.playNote(note);
      setLastLabel(
        `note fret ${note.fret} on string ${note.string} (bar ${note.beat.voice.bar.index + 1})`,
      );
    }
  });

  return (
    <div className={styles.extras}>
      <span>
        Click a beat to hear it. Click one note in a chord to audition that single note.
      </span>
      <span className={styles.badge}>Last auditioned: {lastLabel}</span>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AuditionDemo: React.FC<AuditionDemoProps> = ({
  file = '/files/features/Chords.gp5',
  showCode = true,
}) => (
  <div className={styles.wrapper}>
    <AlphaTabPlayer file={file}>
      <AuditionControls />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  </div>
);
