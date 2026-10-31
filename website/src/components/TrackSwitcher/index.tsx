import React, { useCallback, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabEventValue,
} from "@coderline/alphatab-react";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import styles from "./styles.module.scss";

export interface TrackSwitcherProps {
  showCode?: boolean;
}

interface TrackInfo {
  index: number;
  name: string;
}

const NO_TRACKS: alphaTab.model.Track[] = [];

const Inner: React.FC = () => {
  const api = useAlphaTabApi();
  const scoreTracks =
    useAlphaTabEventValue("scoreLoaded", (score) => score.tracks) ?? NO_TRACKS;

  const tracks: TrackInfo[] = React.useMemo(
    () =>
      scoreTracks.map((t) => ({
        index: t.index,
        name: t.name || `Track ${t.index + 1}`,
      })),
    [scoreTracks],
  );

  const [selected, setSelected] = useState<Set<number>>(new Set([0]));

  useAlphaTabEvent("renderStarted", () => {
    if (!api || api.tracks.length === 0) { return; }
    setSelected(new Set(api.tracks.map((t) => t.index)));
  });

  const applySelection = useCallback(
    (nextIndices: number[]) => {
      const score = api?.score;
      if (!api || !score) {
        return;
      }
      const cleaned = Array.from(new Set(nextIndices)).sort((a, b) => a - b);
      if (cleaned.length === 0) {
        return; // never render zero tracks
      }
      const trackObjs = cleaned.map((i) => score.tracks[i]).filter(Boolean);
      setSelected(new Set(cleaned));
      api.renderTracks(trackObjs);
    },
    [api],
  );

  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) {
      if (next.size === 1) {
        return; // guard against empty selection
      }
      next.delete(i);
    } else {
      next.add(i);
    }
    applySelection(Array.from(next));
  };

  const showOnly = (indices: number[]) => applySelection(indices);
  const showAll = () => applySelection(tracks.map((t) => t.index));

  return (
    <>
      <div className={styles.controls}>
        {tracks.length === 0 ? (
          <span className={styles.placeholder}>Loading tracks…</span>
        ) : (
          <>
            <div className={styles.presets}>
              <button
                type="button"
                className="button button--sm button--secondary"
                onClick={() => showOnly([0])}
              >
                Show track 1
              </button>
              <button
                type="button"
                className="button button--sm button--secondary"
                onClick={() => showOnly([0, 1].filter((i) => i < tracks.length))}
              >
                Show 1 + 2
              </button>
              <button
                type="button"
                className="button button--sm button--secondary"
                onClick={showAll}
              >
                Show all
              </button>
            </div>
            <div className={styles.checkboxes}>
              {tracks.map((t) => (
                <label key={t.index} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selected.has(t.index)}
                    onChange={() => toggle(t.index)}
                  />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
      <AlphaTabHost />
    </>
  );
};

export const TrackSwitcher: React.FC<TrackSwitcherProps> = ({
  showCode = true,
}) => {
  const site = useSiteAlphaTabSettings({ player: true });
  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: {
    file: '/scores/song.gp5',
    tracks: [0],
  },
});

api.scoreLoaded.on((score) => {
  renderCheckboxes(score.tracks);
});

// Later, when the user picks tracks:
api.renderTracks([api.score.tracks[0], api.score.tracks[1]]);`;

  return (
    <div className={styles.demo}>
      {/* Bach Prelude BWV 999 — PD single/multi-staff piece already shipped in the repo. */}
      <AlphaTabProvider
        file="/files/Bach_Prelude_BWV999.gp"
        tracks={[0]}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <Inner />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
