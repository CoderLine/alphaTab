import React, { useCallback, useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabState,
} from "@site/src/alphatab-react";
import styles from "./styles.module.scss";

export interface BytesLoadDemoProps {
  showCode?: boolean;
}

const SOURCE_URL = "/files/features/Chords.gp5";

function probeFormat(bytes: Uint8Array): string {
  // Guitar Pro 7/8: ZIP archive (PK\x03\x04)
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return "Guitar Pro 7/8 (ZIP archive)";
  }
  // GPX (BCFS/BCFZ)
  if (bytes.length >= 4) {
    const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (magic === "BCFS" || magic === "BCFZ") {
      return "Guitar Pro 6 (GPX container)";
    }
  }
  // Older Guitar Pro binary starts with length-prefixed version string
  if (bytes.length > 1 && bytes[0] > 0 && bytes[0] < 32) {
    return "Guitar Pro 3-5 (binary)";
  }
  return "unknown";
}

interface InnerProps {
  byteCount: number | null;
  setByteCount: (n: number | null) => void;
  format: string;
  setFormat: (f: string) => void;
}

const Inner: React.FC<InnerProps> = ({
  byteCount,
  setByteCount,
  format,
  setFormat,
}) => {
  const api = useAlphaTabApi();
  const state = useAlphaTabState();
  const score = state.currentScore;
  const scoreInfo = score
    ? {
        title: score.title || "(untitled)",
        tempo: score.tempo,
        firstTrack: score.tracks[0]?.name ?? "(none)",
      }
    : null;

  const runFetchAndLoad = useCallback(async () => {
    if (!api) {
      return;
    }
    const buffer = await fetch(SOURCE_URL).then((r) => r.arrayBuffer());
    const bytes = new Uint8Array(buffer);
    setByteCount(bytes.byteLength);
    setFormat(probeFormat(bytes));
    api.load(bytes, [0]);
  }, [api, setByteCount, setFormat]);

  useEffect(() => {
    void runFetchAndLoad();
  }, [runFetchAndLoad]);

  return (
    <>
      <div className={styles.status}>
        {byteCount === null ? (
          <span>Fetching bytes…</span>
        ) : (
          <>
            <span>
              Fetched <strong>{byteCount.toLocaleString()}</strong> bytes
            </span>
            <span className={styles.divider}>·</span>
            <span>
              Format probed: <strong>{format}</strong>
            </span>
            {scoreInfo && (
              <>
                <span className={styles.divider}>·</span>
                <span>
                  Title: <strong>{scoreInfo.title}</strong>
                </span>
                <span className={styles.divider}>·</span>
                <span>
                  Tempo: <strong>{scoreInfo.tempo}</strong> BPM
                </span>
              </>
            )}
          </>
        )}
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={() => void runFetchAndLoad()}
          disabled={!api}
        >
          Reload from bytes
        </button>
      </div>
      <AlphaTabCanvas />
    </>
  );
};

export const BytesLoadDemo: React.FC<BytesLoadDemoProps> = ({
  showCode = true,
}) => {
  const [byteCount, setByteCount] = useState<number | null>(null);
  const [format, setFormat] = useState<string>("");

  const code = `const bytes = new Uint8Array(
  await fetch('/scores/song.gp').then((r) => r.arrayBuffer())
);
console.log(\`Fetched \${bytes.byteLength} bytes\`);

api.load(bytes, [0]);
api.scoreLoaded.on((score) => {
  console.log(\`Loaded \${score.title}, tempo \${score.tempo}\`);
});`;

  return (
    <div className={styles.demo}>
      <AlphaTabPlayer player={false}>
        <Inner
          byteCount={byteCount}
          setByteCount={setByteCount}
          format={format}
          setFormat={setFormat}
        />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
