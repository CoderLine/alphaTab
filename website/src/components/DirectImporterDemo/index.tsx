import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab } from "@site/src/hooks";
import styles from "./styles.module.scss";

export interface DirectImporterDemoProps {
  showCode?: boolean;
}

interface InspectedScore {
  title: string;
  artist: string;
  tempo: number;
  trackCount: number;
  tracks: Array<{ name: string; bars: number; tuning: string }>;
}

function inspect(score: alphaTab.model.Score): InspectedScore {
  return {
    title: score.title || "(untitled)",
    artist: score.artist || "(unknown)",
    tempo: score.tempo,
    trackCount: score.tracks.length,
    tracks: score.tracks.map((track) => {
      const bars = track.staves[0]?.bars.length ?? 0;
      const stringTunings = track.staves[0]?.stringTuning?.tunings ?? [];
      const tuningNames = [...stringTunings]
        .reverse()
        .map((midi) => alphaTab.model.Tuning.getTextForTuning(midi, false))
        .join(" ");
      return {
        name: track.name || "(unnamed)",
        bars,
        tuning: tuningNames || "n/a",
      };
    }),
  };
}

export const DirectImporterDemo: React.FC<DirectImporterDemoProps> = ({
  showCode = true,
}) => {
  const [api, element] = useAlphaTab(() => {});
  const [info, setInfo] = useState<InspectedScore | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }
    let cancelled = false;
    (async () => {
      const buffer = await fetch("/files/features/Chords.gp5").then((r) =>
        r.arrayBuffer()
      );
      if (cancelled) {
        return;
      }
      const bytes = new Uint8Array(buffer);
      const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(bytes);
      setInfo(inspect(score));
      api.renderScore(score, [0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const code = `import * as alphaTab from '@coderline/alphatab';

const bytes = new Uint8Array(
  await fetch('/scores/canon.gp').then((r) => r.arrayBuffer())
);
const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(bytes);

console.log(score.title, score.artist, score.tempo);
for (const track of score.tracks) {
  console.log(track.name, track.staves[0].bars.length);
}

// Optionally hand the model to a rendering API.
api.renderScore(score, [0]);`;

  return (
    <div className={styles.demo}>
      <div className={styles.split}>
        <div className={styles.render}>
          <div ref={element}></div>
        </div>
        <aside className={styles.inspection} aria-label="Score inspection">
          <h4>Score model (pre-render)</h4>
          {info ? (
            <pre className={styles.inspectionText}>
              {`score.title:  ${info.title}
score.artist: ${info.artist}
score.tempo:  ${info.tempo}
tracks:       ${info.trackCount}
${info.tracks
  .map(
    (t, i) =>
      `  [${i}] ${t.name} — ${t.bars} bars, tuning: ${t.tuning}`
  )
  .join("\n")}`}
            </pre>
          ) : (
            <p className={styles.placeholder}>Loading…</p>
          )}
        </aside>
      </div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
