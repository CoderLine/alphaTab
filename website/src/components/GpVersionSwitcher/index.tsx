import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
  useAlphaTabState,
} from "@site/src/alphatab-react";
import styles from "./styles.module.scss";

export interface GpVersionSwitcherProps {
  showCode?: boolean;
}

interface Variant {
  key: string;
  label: string;
  file: string;
  badge: string;
}

const VARIANTS: Variant[] = [
  {
    key: "gp3-5",
    label: "GP3-5",
    file: "/files/features/Bends.gp5",
    badge: "binary stream (.gp5)",
  },
  {
    key: "gp6",
    label: "GP6 (.gpx)",
    file: "/files/features/Piano.gpx",
    badge: "custom container (.gpx)",
  },
  {
    key: "gp7-8",
    label: "GP7/8 (.gp)",
    file: "/files/features/Chords.gp5",
    badge: "ZIP archive (.gp)",
  },
];

const INITIAL_VARIANT = VARIANTS[2];

interface InnerProps {
  active: Variant;
  setActive: (v: Variant) => void;
}

const Inner: React.FC<InnerProps> = ({ active, setActive }) => {
  const controls = useAlphaTabControls();
  const state = useAlphaTabState();
  const loadedTitle = state.currentScore
    ? state.currentScore.title || "(untitled)"
    : null;

  const pick = (v: Variant) => {
    if (!controls || v.key === active.key) {
      return;
    }
    setActive(v);
    void controls.loadScoreFromUrl(v.file);
  };

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={active.key === v.key}
            className={`${styles.tab} ${
              active.key === v.key ? styles.tabActive : ""
            }`}
            onClick={() => pick(v)}
          >
            {v.label}
          </button>
        ))}
        <span className={styles.badge}>{active.badge}</span>
        {loadedTitle && (
          <span className={styles.title}>
            Loaded: <strong>{loadedTitle}</strong>
          </span>
        )}
      </div>
      <AlphaTabCanvas />
    </>
  );
};

export const GpVersionSwitcher: React.FC<GpVersionSwitcherProps> = ({
  showCode = true,
}) => {
  const [active, setActive] = useState<Variant>(INITIAL_VARIANT);

  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' }, // GP7/8 ZIP archive
});

// One call site, any version — alphaTab sniffs the bytes.
api.load('/scores/older.gp5');   // GP3-5 binary
api.load('/scores/legacy.gpx');  // GP6 container
api.load('/scores/newer.gp');    // GP7/8 ZIP`;

  return (
    <div className={styles.demo}>
      <AlphaTabPlayer file={INITIAL_VARIANT.file} player={true}>
        <Inner active={active} setActive={setActive} />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
