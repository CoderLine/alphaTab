'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState, useEffect } from 'react';
import { TransportControls } from './TransportControls';
import styles from './styles.module.scss';

export interface ToggleSettingDemoProps {
  file?: string;
  tex?: string;
  settingPath: string;
  label: string;
  onValue: unknown;
  offValue: unknown;
  defaultOn?: boolean;
  reRender?: boolean;
  showCode?: boolean;
}

function setByPath(target: any, path: string, value: unknown) {
  const parts = path.split('.');
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
    if (cur === undefined || cur === null) return;
  }
  cur[parts[parts.length - 1]] = value;
}

export const ToggleSettingDemo: React.FC<ToggleSettingDemoProps> = ({
  file,
  tex,
  settingPath,
  label,
  onValue,
  offValue,
  defaultOn = true,
  reRender = false,
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [on, setOn] = useState(defaultOn);

  useEffect(() => {
    if (!api) return;
    setByPath(api.settings, settingPath, on ? onValue : offValue);
    api.updateSettings();
    if (reRender && api.score) {
      api.render();
    }
  }, [api, on]);

  const resolvedFile = tex ? undefined : file ?? '/files/canon.gp';

  return (
    <TransportControls
      file={resolvedFile}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <label className={styles.fieldRow}>
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => setOn(e.target.checked)}
          />
          {label}
        </label>
      )}
    />
  );
};
