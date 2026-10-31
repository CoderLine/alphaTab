import React from 'react';
import type * as alphaTab from '@coderline/alphatab';
import { CompactPlayer } from '@coderline/alphatab-ui';

export interface AlphaTabProps {
  file?: string;
  tex?: boolean | string;
  tracks?: number[] | 'all';
  settings?: alphaTab.json.SettingsJson;
  /** Adds a transport row and enables playback; off by default. */
  player?: boolean | 'true' | 'false';
  children?: string | React.ReactElement;
}

/**
 * The score embed of MDX pages: a `<CompactPlayer>`. alphaTex comes either as a string via
 * `tex="..."` or, with `tex={true}`, as the children.
 */
export const AlphaTab: React.FC<AlphaTabProps> = ({
  file,
  tex,
  tracks,
  settings,
  player,
  children,
}) => {
  const texContent =
    typeof tex === 'string' && tex !== 'true'
      ? tex
      : tex && typeof children === 'string'
        ? children
        : undefined;

  return (
    <CompactPlayer
      file={file}
      tex={texContent}
      tracks={tracks}
      settings={settings}
      player={player === true || player === 'true'}
    />
  );
};
