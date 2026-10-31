import React, { useCallback, useEffect, useRef, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import type * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi } from "@coderline/alphatab-react";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface ImporterKnobsDemoProps {
  showCode?: boolean;
}

const SOURCE_URL = "/files/features/Text.gp5";
const ENCODINGS = ["utf-8", "windows-1252"] as const;
type Encoding = (typeof ENCODINGS)[number];

const IMPORTER_SETTINGS: alphaTab.json.SettingsJson = { importer: { beatTextAsLyrics: false } };

interface InnerProps {
  beatTextAsLyrics: boolean;
  setBeatTextAsLyrics: (v: boolean) => void;
  encoding: Encoding;
  setEncoding: (v: Encoding) => void;
}

const Inner: React.FC<InnerProps> = ({
  beatTextAsLyrics,
  setBeatTextAsLyrics,
  encoding,
  setEncoding,
}) => {
  const api = useAlphaTabApi();
  const bytesRef = useRef<Uint8Array | null>(null);

  const applyAndLoad = useCallback(
    (asLyrics: boolean, enc: Encoding) => {
      if (!api || !bytesRef.current) {
        return;
      }
      api.settings.importer.beatTextAsLyrics = asLyrics;
      api.settings.importer.gp3To5encoding = enc;
      api.updateSettings();
      // Clone the bytes so alphaTab always sees a fresh buffer.
      api.load(bytesRef.current.slice(), [0]);
    },
    [api],
  );

  // fetch once
  useEffect(() => {
    if (!api) {
      return;
    }
    let cancelled = false;
    fetch(SOURCE_URL)
      .then((r) => r.arrayBuffer())
      .then((buffer) => {
        if (!cancelled) {
          bytesRef.current = new Uint8Array(buffer);
          applyAndLoad(beatTextAsLyrics, encoding);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const toggleLyrics = () => {
    const next = !beatTextAsLyrics;
    setBeatTextAsLyrics(next);
    applyAndLoad(next, encoding);
  };

  const onEncodingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Encoding;
    setEncoding(next);
    applyAndLoad(beatTextAsLyrics, next);
  };

  return (
    <>
      <div className={styles.controls}>
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={beatTextAsLyrics}
            onChange={toggleLyrics}
          />
          <span>Beat text as lyrics</span>
        </label>

        <label className={styles.control}>
          <span>Encoding (GP3-5)</span>
          <select value={encoding} onChange={onEncodingChange}>
            {ENCODINGS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.readonly}>
          <span className={styles.readonlyLabel}>Max decoding buffer</span>
          <span className={styles.readonlyValue}>128 MB (default)</span>
        </div>

        <div className={styles.readonly}>
          <span className={styles.readonlyLabel}>Part-group merging</span>
          <span className={styles.readonlyValue}>
            MusicXML-only —
            <a href="./musicxml"> see MusicXML</a>
          </span>
        </div>
      </div>
      <AlphaTabHost />
    </>
  );
};

export const ImporterKnobsDemo: React.FC<ImporterKnobsDemoProps> = ({
  showCode = true,
}) => {
  const [beatTextAsLyrics, setBeatTextAsLyrics] = useState(false);
  const [encoding, setEncoding] = useState<Encoding>("windows-1252");
  const site = useSiteAlphaTabSettings({ player: true, settings: IMPORTER_SETTINGS });

  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/oldfile.gp5' },
  importer: {
    beatTextAsLyrics: true,      // reinterpret beat text as lyric syllables
    gp3To5encoding: 'windows-1252', // legacy GP3-5 code page
    mergePartGroupsInMusicXml: true, // MusicXML-only
    maxDecodingBufferSize: 128_000_000, // safety cap in bytes
  },
});`;

  return (
    <div className={styles.demo}>
      <AlphaTabProvider
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <Inner
          beatTextAsLyrics={beatTextAsLyrics}
          setBeatTextAsLyrics={setBeatTextAsLyrics}
          encoding={encoding}
          setEncoding={setEncoding}
        />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
