import React, { useEffect, useState } from "react";
import type { model } from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
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

function inspect(
  score: model.Score,
  Tuning: typeof import("@coderline/alphatab").model.Tuning,
): InspectedScore {
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
        .map((midi) => Tuning.getTextForTuning(midi, false))
        .join(" ");
      return {
        name: track.name || "(unnamed)",
        bars,
        tuning: tuningNames || "n/a",
      };
    }),
  };
}

interface InnerProps {
  info: InspectedScore | null;
  setInfo: (info: InspectedScore | null) => void;
}

const Inner: React.FC<InnerProps> = ({ setInfo }) => {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();

  useEffect(() => {
    if (!api || !module) {
      return;
    }
    let cancelled = false;
    (async () => {
      const buffer = await fetch("/files/features/Chords.gp5").then((r) =>
        r.arrayBuffer(),
      );
      if (cancelled) {
        return;
      }
      const bytes = new Uint8Array(buffer);
      const score = module.importer.ScoreLoader.loadScoreFromBytes(
        bytes,
        api.settings,
      );
      setInfo(inspect(score, module.model.Tuning));
      api.renderScore(score, [0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [api, module, setInfo]);

  return <AlphaTabCanvas />;
};

export const DirectImporterDemo: React.FC<DirectImporterDemoProps> = ({
  showCode = true,
}) => {
  const [info, setInfo] = useState<InspectedScore | null>(null);

  const code = `import * as alphaTab from '@coderline/alphatab';

const bytes = new Uint8Array(
  await fetch('/scores/song.gp').then((r) => r.arrayBuffer())
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
          <AlphaTabPlayer player={false}>
            <Inner info={info} setInfo={setInfo} />
          </AlphaTabPlayer>
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
      `  [${i}] ${t.name} — ${t.bars} bars, tuning: ${t.tuning}`,
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
