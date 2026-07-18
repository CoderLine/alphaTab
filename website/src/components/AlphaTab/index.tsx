import React from 'react';
import type * as alphaTab from '@coderline/alphatab';
import { AlphaTabScore } from '@site/src/alphatab-react';

export interface AlphaTabProps {
  file?: string;
  tex?: boolean | string;
  tracks?: number[] | 'all';
  settings?: alphaTab.json.SettingsJson;
  player?: boolean;
  children?: string | React.ReactElement;
}

/**
 * Backwards-compatible shim over `<AlphaTabScore>`. MDX pages import
 * `<AlphaTab>` and pass alphaTex either as a string via `tex="..."` or
 * flagged as `tex={true}` with the source as children. Both forms are
 * normalized into the modern `AlphaTabScore` `tex` prop.
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
    <AlphaTabScore
      file={file}
      tex={texContent}
      tracks={tracks}
      settings={settings}
      player={player ?? false}
    />
  );
};
