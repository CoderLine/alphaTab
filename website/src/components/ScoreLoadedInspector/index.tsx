import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import styles from "./styles.module.scss";

export interface ScoreLoadedInspectorProps {
  showCode?: boolean;
}

interface ScoreInfo {
  title: string;
  artist: string;
  tempo: number;
  tracks: Array<{ name: string; staves: number }>;
}

const SOURCE_URL = "/files/features/Skillet.gp5";

export const ScoreLoadedInspector: React.FC<ScoreLoadedInspectorProps> = ({
  showCode = true,
}) => {
  const [api, element] = useAlphaTab((s) => {
    s.core.file = SOURCE_URL;
  });
  const [info, setInfo] = useState<ScoreInfo | null>(null);

  useAlphaTabEvent(api, "scoreLoaded", (score: alphaTab.model.Score) => {
    setInfo({
      title: score.title || "(untitled)",
      artist: score.artist || "(unknown)",
      tempo: score.tempo,
      tracks: score.tracks.map((t) => ({
        name: t.name || "(unnamed)",
        staves: t.staves.length,
      })),
    });
  });

  const reload = () => {
    if (!api) {
      return;
    }
    setInfo(null);
    api.load(SOURCE_URL);
  };

  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp5' },
});

api.scoreLoaded.on((score) => {
  panel.querySelector('.title').textContent = score.title;
  panel.querySelector('.artist').textContent = score.artist;
  panel.querySelector('.tempo').textContent = \`\${score.tempo} BPM\`;
  panel.querySelector('.tracks').textContent = String(score.tracks.length);
});`;

  return (
    <div className={styles.demo}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h4>Score info</h4>
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={reload}
            disabled={!api}
          >
            Reload
          </button>
        </div>
        {info ? (
          <div className={styles.grid}>
            <div>
              <span className={styles.label}>Title</span>
              <span className={styles.value}>{info.title}</span>
            </div>
            <div>
              <span className={styles.label}>Artist</span>
              <span className={styles.value}>{info.artist}</span>
            </div>
            <div>
              <span className={styles.label}>Tempo</span>
              <span className={styles.value}>{info.tempo} BPM</span>
            </div>
            <div>
              <span className={styles.label}>Tracks</span>
              <span className={styles.value}>{info.tracks.length}</span>
            </div>
            <ul className={styles.tracks}>
              {info.tracks.map((t, i) => (
                <li key={i}>
                  {t.name}{" "}
                  <span className={styles.staff}>
                    ({t.staves} staff{t.staves === 1 ? "" : "es"})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={styles.placeholder}>
            Waiting for <code>scoreLoaded</code>…
          </p>
        )}
      </div>
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
