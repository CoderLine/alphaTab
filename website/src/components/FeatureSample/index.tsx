'use client';

import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import * as alphaTab from '@coderline/alphatab';
import { AlphaTab } from '../AlphaTab';

const DEFAULT_TEX = `\\title "Hello alphaTab"
.
:4 0.6 1.6 3.6 0.5 2.5 3.5 0.4 2.4 |
   3.4 0.3 2.3 0.2 1.2 3.2 0.1 1.1 |
   3.1.1`;

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
