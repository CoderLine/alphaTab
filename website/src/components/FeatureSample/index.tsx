'use client';

import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import * as alphaTab from '@coderline/alphatab';
import { AlphaTab } from '../AlphaTab';
import * as Riffs from '@site/src/tex-riffs';

const DEFAULT_TEX = Riffs.STEADY_PULSE;

export interface FeatureSampleProps {
  code: string;
  language?: string;
  settings?: alphaTab.json.SettingsJson;
  tex?: string;
  player?: boolean;
  tracks?: number[] | 'all';
}

export const FeatureSample: React.FC<FeatureSampleProps> = ({
  code,
  language = 'js',
  settings,
  tex,
  player,
  tracks,
}) => {
  const score = tex ?? DEFAULT_TEX;
  return (
    <div>
      <CodeBlock language={language}>{code.trim()}</CodeBlock>
      <AlphaTab tex={true} player={player} tracks={tracks} settings={settings}>
        {score}
      </AlphaTab>
    </div>
  );
};
