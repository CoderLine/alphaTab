import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import styles from "./styles.module.scss";

export interface UrlLoadSwitcherProps {
  showCode?: boolean;
}

const CHORDS_URL = "/files/features/Chords.gp5";
const RHYTHM_URL = "/files/features/Rhythm.gp5";

export const UrlLoadSwitcher: React.FC<UrlLoadSwitcherProps> = ({
  showCode = true,
}) => {
  const [api, element] = useAlphaTab((s) => {
    s.core.file = CHORDS_URL;
  });
  const [currentUrl, setCurrentUrl] = useState(CHORDS_URL);
  const [meta, setMeta] = useState<{ title: string; artist: string } | null>(
    null
  );

  useAlphaTabEvent(api, "scoreLoaded", (score: alphaTab.model.Score) => {
    setMeta({
      title: score.title || "(untitled)",
      artist: score.artist || "(unknown)",
    });
  });

  const loadUrl = (url: string) => {
    if (!api) {
      return;
    }
    setMeta(null);
    setCurrentUrl(url);
    api.load(url);
  };

  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/chords.gp5' },
});

document.getElementById('load-chords').addEventListener('click', () => {
  api.load('/scores/chords.gp5');
});
document.getElementById('load-rhythm').addEventListener('click', () => {
  api.load('/scores/rhythm.gp5');
});`;

  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        <button
          type="button"
          className={`button button--sm ${
            currentUrl === CHORDS_URL ? "button--primary" : "button--secondary"
          }`}
          onClick={() => loadUrl(CHORDS_URL)}
        >
          Chord progression
        </button>
        <button
          type="button"
          className={`button button--sm ${
            currentUrl === RHYTHM_URL ? "button--primary" : "button--secondary"
          }`}
          onClick={() => loadUrl(RHYTHM_URL)}
        >
          Rhythm groove
        </button>
        <span className={styles.urlLabel}>
          <code>{currentUrl}</code>
        </span>
      </div>
      {meta && (
        <div className={styles.status}>
          <strong>{meta.title}</strong>
          <span> — {meta.artist}</span>
        </div>
      )}
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
