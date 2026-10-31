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
  /**
   * Reload the score after applying the setting change. Required for
   * settings that alphaTab reads only at parse time — most notably
   * `notation.notationMode`, which the renderer cannot switch mid-flight
   * without producing stale beat bounds.
   */
  reload?: boolean;
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
  reload: boolean;
  file?: string;
  tex?: string;
}> = ({
  settingPath,
  label,
  onValue,
  offValue,
  defaultOn,
  reRender,
  reload,
  file,
  tex,
}) => {
  const controls = useAlphaTabControls();
  const [on, setOn] = useState(defaultOn);
  const isInitialRender = React.useRef(true);

  useEffect(() => {
    if (!controls) { return; }
    const patch = patchFromPath(settingPath, on ? onValue : offValue);
    controls.updateSettings(patch);
    // On the first mount the score is loaded fresh with the seed settings, so
    // we only need to reload for subsequent toggles.
    if (reload && !isInitialRender.current) {
      if (tex) { controls.loadScoreFromTex(tex); }
      else if (file) { void controls.loadScoreFromUrl(file); }
    }
    isInitialRender.current = false;
  }, [controls, on, settingPath, onValue, offValue, reload, tex, file]);

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
  reload = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCode = true,
}) => {
  const initialSetting = React.useMemo(
    () => patchFromPath(settingPath, defaultOn ? onValue : offValue),
    [settingPath, defaultOn, onValue, offValue],
  );

  return (
    <div className={styles.wrapper}>
      <AlphaTabPlayer file={file} tex={tex} settings={initialSetting}>
        <TransportBar />
        <ToggleControls
          settingPath={settingPath}
          label={label}
          onValue={onValue}
          offValue={offValue}
          defaultOn={defaultOn}
          reRender={reRender}
          reload={reload}
          file={file}
          tex={tex}
        />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
    </div>
  );
};
