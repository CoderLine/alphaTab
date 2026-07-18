'use client';

import React, { useState, useEffect } from 'react';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
  useAlphaTabApi,
} from '@site/src/alphatab-react';
import { TransportBar } from './TransportControls';
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

function patchFromPath(path: string, value: unknown): Record<string, unknown> {
  const parts = path.split('.');
  const root: Record<string, unknown> = {};
  let cur: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const next: Record<string, unknown> = {};
    cur[parts[i]] = next;
    cur = next;
  }
  cur[parts[parts.length - 1]] = value;
  return root;
}

const ToggleControls: React.FC<{
  settingPath: string;
  label: string;
  onValue: unknown;
  offValue: unknown;
  defaultOn: boolean;
  reRender: boolean;
}> = ({ settingPath, label, onValue, offValue, defaultOn, reRender }) => {
  const controls = useAlphaTabControls();
  const api = useAlphaTabApi();
  const [on, setOn] = useState(defaultOn);

  useEffect(() => {
    if (!controls) return;
    const patch = patchFromPath(settingPath, on ? onValue : offValue);
    controls.updateSettings(patch);
    if (reRender && api?.score) {
      // updateSettings via the store already re-renders when a score is
      // loaded, so `reRender` is effectively always honored — kept as a
      // prop for API compatibility.
    }
  }, [controls, api, on, settingPath, onValue, offValue, reRender]);

  return (
    <div className={styles.extras}>
      <label className={styles.fieldRow}>
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
};

export const ToggleSettingDemo: React.FC<ToggleSettingDemoProps> = ({
  file,
  tex,
  settingPath,
  label,
  onValue,
  offValue,
  defaultOn = true,
  reRender = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCode = true,
}) => {
  const resolvedFile = tex ? undefined : file ?? '/files/canon.gp';

  return (
    <div className={styles.wrapper}>
      <AlphaTabPlayer file={resolvedFile} tex={tex}>
        <TransportBar />
        <ToggleControls
          settingPath={settingPath}
          label={label}
          onValue={onValue}
          offValue={offValue}
          defaultOn={defaultOn}
          reRender={reRender}
        />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
    </div>
  );
};
