import React from 'react';
import type * as alphaTab from '@coderline/alphatab';
import { PlayerScore } from '@coderline/alphatab-ui';

export interface AlphaTabProps {
  file?: string;
  tex?: boolean | string;
  tracks?: number[] | 'all';
  settings?: alphaTab.json.SettingsJson;
  player?: boolean;
  children?: string | React.ReactElement;
}

/**
 * Backwards-compatible shim over `<PlayerScore>`. MDX pages import
 * `<AlphaTab>` and pass alphaTex either as a string via `tex="..."` or
 * flagged as `tex={true}` with the source as children. Both forms are
 * normalized into the modern `PlayerScore` `tex` prop.
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
    typeof tex === 'string'
      ? tex
      : tex && typeof children === 'string'
        ? children
        : undefined;

  return (
    <PlayerScore
      file={file}
      tex={texContent}
      tracks={tracks}
      settings={settings}
      // Temporary: audio on for every feature demo so authors can verify each
      // score sounds musically sensible. Revert to `player ?? false` once the
      // sweep is done — feature demos that don't need audio shouldn't pay the
      // audio-worklet + SoundFont cost by default.
      player={player ?? true}
    />
  );
};
