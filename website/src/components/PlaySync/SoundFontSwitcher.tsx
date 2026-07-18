'use client';

import React, { useState } from 'react';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
} from '@site/src/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface SoundFontOption {
  label: string;
  url?: string; // undefined = bundled sonivox
}

export interface SoundFontSwitcherProps {
  file?: string;
  tex?: string;
  options?: SoundFontOption[];
  append?: boolean;
  showCode?: boolean;
}

const DEFAULT_OPTIONS: SoundFontOption[] = [{ label: 'Sonivox (bundled)' }];

const SoundFontControls: React.FC<{ options: SoundFontOption[]; append: boolean }> = ({
  options,
  append,
}) => {
  const api = useAlphaTabApi();
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState('bundled Sonivox active');
  const [loading, setLoading] = useState(false);

  useAlphaTabEvent(
    'soundFontLoaded',
    () => {
      setLoading(false);
      setStatus(`${options[selected].label} loaded`);
    },
    [options, selected],
  );

  const loadFont = async (index: number) => {
    setSelected(index);
    const opt = options[index];
    if (!api) return;
    if (!opt.url) {
      // bundled — reset to defaults
      api.resetSoundFonts();
      setStatus('bundled Sonivox active');
      return;
    }
    setLoading(true);
    setStatus(`loading ${opt.label}…`);
    try {
      api.loadSoundFont(opt.url, append);
    } catch (err) {
      setLoading(false);
      setStatus(`load failed: ${(err as Error).message}`);
    }
  };

  const isSingle = options.length === 1;

  return (
    <div className={styles.extras}>
      {append ? (
        <div className={styles.fieldRow}>
          {options.map((opt, i) => (
            <button
              key={i}
              className={styles.mixerBtn}
              onClick={() => loadFont(i)}
              disabled={loading || !opt.url}
            >
              {opt.url ? `Load ${opt.label}` : opt.label}
            </button>
          ))}
        </div>
      ) : (
        <label className={styles.fieldRow}>
          SoundFont:
          <select
            value={selected}
            onChange={(e) => loadFont(parseInt(e.target.value, 10))}
            disabled={loading || isSingle}
          >
            {options.map((opt, i) => (
              <option key={i} value={i}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <span className={styles.badge}>{status}</span>
    </div>
  );
};

export const SoundFontSwitcher: React.FC<SoundFontSwitcherProps> = ({
  file,
  tex,
  options = DEFAULT_OPTIONS,
  append = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCode = true,
}) => (
  <div className={styles.wrapper}>
    <AlphaTabPlayer file={file} tex={tex}>
      <TransportBar />
      <SoundFontControls options={options} append={append} />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  </div>
);
