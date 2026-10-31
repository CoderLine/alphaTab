import React, { useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { PlayerProvider, PlayerHost, usePlayerControls, usePlayerState } from "@coderline/alphatab-ui";
import { BACH_PRELUDE_C_LONG } from "@site/src/tex-riffs";

// Default sample: Bach, WTC I Prelude in C major BWV 846 bars 1–12 —
// 12 bars is enough content to page through with the start-bar / bar-count
// controls. Pitches 1:1 from the Bach-Gesellschaft edition (PD).
// See src/tex-riffs.ts for per-note verification.
const DEFAULT_TEX = BACH_PRELUDE_C_LONG;

export interface BarRangeDemoProps {
  showCode?: boolean;
  file?: string;
  tex?: string;
  step?: number;
}

function ApplyRange({
  startBar,
  barCount,
  onTotalBarsChange,
}: {
  startBar: number;
  barCount: number;
  onTotalBarsChange: (n: number) => void;
}) {
  const controls = usePlayerControls();
  const state = usePlayerState();
  useEffect(() => {
    if (controls) {
      controls.updateSettings({ display: { startBar, barCount } });
    }
  }, [controls, startBar, barCount]);
  useEffect(() => {
    onTotalBarsChange(state.totalBars);
  }, [state.totalBars, onTotalBarsChange]);
  return null;
}

export const BarRangeDemo: React.FC<BarRangeDemoProps> = ({
  showCode = true,
  file,
  tex,
  step = 4,
}) => {
  const [startBar, setStartBar] = useState(1);
  const [totalBars, setTotalBars] = useState(0);
  const barCount = step;

  const useTex = !file;
  const texContent = useTex ? tex ?? DEFAULT_TEX : undefined;

  const endBar =
    totalBars > 0
      ? Math.min(startBar + barCount - 1, totalBars)
      : startBar + barCount - 1;

  const prev = () => setStartBar((s) => Math.max(1, s - step));
  const next = () =>
    setStartBar((s) => {
      const nextStart = s + step;
      if (totalBars > 0 && nextStart > totalBars) {
        return s;
      }
      return nextStart;
    });

  const canPrev = startBar > 1;
  const canNext = totalBars === 0 || startBar + step <= totalBars;

  const code = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
  display: { startBar: 1, barCount: ${step} },
});

document.getElementById('next-page').addEventListener('click', () => {
  api.settings.display.startBar += ${step};
  api.updateSettings();
  api.render();
});`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.75rem",
          padding: "0.75rem",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "6px",
          background: "var(--ifm-background-surface-color)",
        }}
      >
        <button
          className="button button--secondary button--sm"
          onClick={prev}
          disabled={!canPrev}
        >
          ← Prev {step}
        </button>
        <button
          className="button button--secondary button--sm"
          onClick={next}
          disabled={!canNext}
        >
          Next {step} →
        </button>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          bars {startBar}–{endBar}
          {totalBars > 0 ? ` of ${totalBars}` : ""}
        </span>
      </div>
      <PlayerProvider
        file={file}
        tex={texContent}
        player={true}
        settings={{ display: { startBar: 1, barCount: step } }}
      >
        <ApplyRange
          startBar={startBar}
          barCount={barCount}
          onTotalBarsChange={setTotalBars}
        />
        <PlayerHost />
      </PlayerProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
