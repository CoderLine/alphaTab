import React from "react";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEventValue,
} from "@coderline/alphatab-react";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface ScoreLoadedInspectorProps {
  showCode?: boolean;
}

const SOURCE_URL = "/files/Bach_Prelude_BWV999.gp";

const Inner: React.FC = () => {
  const api = useAlphaTabApi();
  const score = useAlphaTabEventValue("scoreLoaded", (s) => s) ?? null;
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
    if (!api) {
      return;
    }
    api.load(SOURCE_URL);
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
      <AlphaTabHost />
    </>
  );
};

export const ScoreLoadedInspector: React.FC<ScoreLoadedInspectorProps> = ({
  showCode = true,
}) => {
  const site = useSiteAlphaTabSettings({ player: true });
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
      <AlphaTabProvider
        file={SOURCE_URL}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <Inner />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
