'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState } from 'react';
import { useAlphaTab, useAlphaTabEvent } from '@site/src/hooks';
import styles from './styles.module.scss';

export interface AuditionDemoProps {
  file?: string;
  showCode?: boolean;
}

export const AuditionDemo: React.FC<AuditionDemoProps> = ({
  file = '/files/features/Chords.gp5',
  showCode = true,
}) => {
  const [api, element] = useAlphaTab((s) => {
    s.core.file = file;
    s.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
    s.player.scrollOffsetY = -50;
    s.player.scrollMode = alphaTab.ScrollMode.Off;
  });

  const [lastLabel, setLastLabel] = useState('nothing yet');

  useAlphaTabEvent(api, 'beatMouseDown', (beat: alphaTab.model.Beat) => {
    api?.playBeat(beat);
    const barIndex = beat.voice.bar.index + 1;
    const beatIndex = beat.index + 1;
    setLastLabel(`beat @ bar ${barIndex} beat ${beatIndex}`);
  });

  useAlphaTabEvent(api, 'noteMouseDown', (note: alphaTab.model.Note) => {
    // noteMouseDown fires alongside beatMouseDown — only audition the single note when it's a chord
    if (note.beat.notes.length > 1) {
      api?.playNote(note);
      setLastLabel(
        `note fret ${note.fret} on string ${note.string} (bar ${note.beat.voice.bar.index + 1})`
      );
    }
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.extras}>
        <span>
          Click a beat to hear it. Click one note in a chord to audition that single note.
        </span>
        <span className={styles.badge}>Last auditioned: {lastLabel}</span>
      </div>
      <div ref={element} />
    </div>
  );
};
