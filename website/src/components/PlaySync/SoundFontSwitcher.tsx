'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState } from 'react';
import { TransportControls } from './TransportControls';
import { useAlphaTabEvent } from '@site/src/hooks';
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

export const SoundFontSwitcher: React.FC<SoundFontSwitcherProps> = ({
  file,
  tex,
  options = DEFAULT_OPTIONS,
  append = false,
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState('bundled Sonivox active');
  const [loading, setLoading] = useState(false);

  useAlphaTabEvent(api, 'soundFontLoaded', () => {
    setLoading(false);
    setStatus(`${options[selected].label} loaded`);
  });

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
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <>
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
        </>
      )}
    />
  );
};
