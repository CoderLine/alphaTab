import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabEventValue } from "@coderline/alphatab-react";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface UrlLoadSwitcherProps {
  showCode?: boolean;
}

const CHORDS_URL = "/files/features/Chords.gp5";
const RHYTHM_URL = "/files/features/Rhythm.gp5";

interface InnerProps {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
}

const Inner: React.FC<InnerProps> = ({ currentUrl, setCurrentUrl }) => {
  const score = useAlphaTabEventValue("scoreLoaded", (s) => s) ?? null;
  const meta = score
    ? {
        title: score.title || "(untitled)",
        artist: score.artist || "(unknown)",
      }
    : null;

  return (
    <>
      <div className={styles.controls}>
        <button
          type="button"
          className={`button button--sm ${
            currentUrl === CHORDS_URL ? "button--primary" : "button--secondary"
          }`}
          onClick={() => setCurrentUrl(CHORDS_URL)}
        >
          Chord progression
        </button>
        <button
          type="button"
          className={`button button--sm ${
            currentUrl === RHYTHM_URL ? "button--primary" : "button--secondary"
          }`}
          onClick={() => setCurrentUrl(RHYTHM_URL)}
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
      <AlphaTabHost />
    </>
  );
};

export const UrlLoadSwitcher: React.FC<UrlLoadSwitcherProps> = ({
  showCode = true,
}) => {
  const [currentUrl, setCurrentUrl] = useState(CHORDS_URL);
  const site = useSiteAlphaTabSettings();

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
      <AlphaTabProvider
        file={currentUrl}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <Inner currentUrl={currentUrl} setCurrentUrl={setCurrentUrl} />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
