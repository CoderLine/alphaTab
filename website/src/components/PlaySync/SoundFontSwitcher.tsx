'use client';

import React, { useState } from 'react';
import { PlayerProvider, PlayerHost } from '@coderline/alphatab-ui';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface SoundFontOption {
  label: string;
  /** URL of the SoundFont file. Omit to reset to the bundled default. */
  url?: string;
}

export interface SoundFontSwitcherProps {
  file?: string;
  tex?: string;
  /**
   * Preset SoundFonts the reader can pick from. The default option (no
   * `url`) resets to the bundled font shipped with the synth.
   */
  options?: SoundFontOption[];
  /**
   * Show a text input for a user-supplied SoundFont URL. Handy for
   * `custom-soundfonts` where the reader wants to test their own file.
   */
  allowCustomUrl?: boolean;
  /**
   * Load each button additively via `loadSoundFont(url, true)`. Used on the
   * `combining-multiple-soundfonts` page where each click layers another
   * bank on top of what is already loaded.
   */
  append?: boolean;
  showCode?: boolean;
}

const DEFAULT_OPTIONS: SoundFontOption[] = [{ label: 'Sonivox (bundled)' }];

const BUNDLED_SOUNDFONT_URL = '/soundfont/sonivox.sf3';
const PLAYER_SETTINGS = { player: { soundFont: BUNDLED_SOUNDFONT_URL } };

const SoundFontControls: React.FC<{
  options: SoundFontOption[];
  allowCustomUrl: boolean;
  append: boolean;
}> = ({ options, allowCustomUrl, append }) => {
  const api = useAlphaTabApi();
  const [selected, setSelected] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [status, setStatus] = useState('bundled Sonivox active');
  const [loading, setLoading] = useState(false);

  useAlphaTabEvent(
    'soundFontLoaded',
    () => {
      setLoading(false);
      setStatus((prev) => prev.replace('loading ', 'loaded: '));
    },
  );

  const loadFromUrl = async (url: string, label: string) => {
    if (!api) { return; }
    setLoading(true);
    setStatus(`loading ${label}…`);
    try {
      api.loadSoundFont(url, append);
    } catch (err) {
      setLoading(false);
      setStatus(`load failed: ${(err as Error).message}`);
    }
  };

  const chooseOption = (index: number) => {
    setSelected(index);
    const opt = options[index];
    if (!api) { return; }
    if (!opt.url) {
      setLoading(true);
      setStatus('loading bundled Sonivox…');
      api.loadSoundFont(BUNDLED_SOUNDFONT_URL, false);
      return;
    }
    void loadFromUrl(opt.url, opt.label);
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
              onClick={() => chooseOption(i)}
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
            onChange={(e) => chooseOption(parseInt(e.target.value, 10))}
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
      {allowCustomUrl && (
        <div className={styles.fieldRow}>
          <input
            type="url"
            placeholder="https://example.com/your.sf2"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            disabled={loading}
            style={{ flex: 1, minWidth: 240 }}
          />
          <button
            className={styles.mixerBtn}
            onClick={() => customUrl && loadFromUrl(customUrl, 'custom URL')}
            disabled={loading || !customUrl}
          >
            Load URL
          </button>
        </div>
      )}
      <span className={styles.badge}>{status}</span>
    </div>
  );
};

export const SoundFontSwitcher: React.FC<SoundFontSwitcherProps> = ({
  file,
  tex,
  options = DEFAULT_OPTIONS,
  allowCustomUrl = false,
  append = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCode = true,
}) => (
  <div className={styles.wrapper}>
    <PlayerProvider file={file} tex={tex} settings={PLAYER_SETTINGS}>
      <TransportBar />
      <SoundFontControls
        options={options}
        allowCustomUrl={allowCustomUrl}
        append={append}
      />
      <PlayerHost />
    </PlayerProvider>
  </div>
);
