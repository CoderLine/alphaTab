import React from "react";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
  useAlphaTabState,
} from "@site/src/alphatab-react";
import styles from "./styles.module.scss";

export interface ScoreLoadedInspectorProps {
  showCode?: boolean;
}

const SOURCE_URL = "/files/features/Skillet.gp5";

const Inner: React.FC = () => {
  const state = useAlphaTabState();
  const controls = useAlphaTabControls();
  const score = state.currentScore;
  const info = score
    ? {
        title: score.title || "(untitled)",
        artist: score.artist || "(unknown)",
        tempo: score.tempo,
        tracks: score.tracks.map((t) => ({
          name: t.name || "(unnamed)",
          staves: t.staves.length,
        })),
      }
    : null;

  const reload = () => {
    if (!controls) {
      return;
    }
    void controls.loadScoreFromUrl(SOURCE_URL);
  };

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h4>Score info</h4>
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={reload}
            disabled={!controls}
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
      <AlphaTabCanvas />
    </>
  );
};

export const ScoreLoadedInspector: React.FC<ScoreLoadedInspectorProps> = ({
  showCode = true,
}) => {
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
      <AlphaTabPlayer file={SOURCE_URL} player={true}>
        <Inner />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
