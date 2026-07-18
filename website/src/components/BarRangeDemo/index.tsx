import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";

const DEFAULT_TEX = `\\title "Bar-range paging"
\\tempo 100
.
\\track "Guitar"
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1) |
  :8 3.4 5.4 7.4 8.4 10.4 8.4 7.4 5.4 |
  :4 (3.5 5.4 7.3) (5.5 7.4 9.3) :2 (7.5 9.4 12.3) |
  :4 5.6 7.6 8.6 10.6 |
  :4 (3.3 5.2 7.1) (5.3 7.2 8.1) :2 (3.3 5.2 7.1) |
  :8 12.4 10.4 8.4 7.4 5.4 3.4 2.4 0.4 |
  :4 (0.6 2.5 3.4) (3.6 5.5 7.4) :2 (5.6 7.5 8.4) |
  :4 8.5 10.5 12.5 14.5 |
  :8 10.6 12.6 14.6 15.6 17.6 15.6 14.6 12.6 |
  :4 (7.3 9.2 12.1) (5.3 7.2 9.1) :2 (3.3 5.2 7.1) |
  :4 (3.3 5.2 7.1) (2.3 3.2 5.1) :8 3.4 5.4 7.4 8.4 |
  :4 (0.6 2.5 3.4) :8 (3.6 5.5 7.4) (5.6 7.5 8.4) :4 (7.6 9.5 12.4) |
  :4 (5.3 7.2 9.1) (3.3 5.2 7.1) :2 (2.3 3.2 5.1) |
  :4 (5.6 7.5 8.4) (7.6 9.5 12.4) :2 (5.6 7.5 8.4) |
  :8 3.6 5.6 7.6 8.6 10.6 8.6 7.6 5.6 |
  :4 (3.3 5.2 7.1) (5.3 7.2 8.1) :2 (3.3 5.2 7.1) |
  :2 (3.3 5.2 7.1) (2.3 3.2 5.1) |
  :4 12.4 10.4 8.4 7.4 |
  :4 (7.3 9.2 12.1) (5.3 7.2 9.1) :2 (3.3 5.2 7.1) |
  :4 5.5 7.5 8.5 10.5 |
  :2 (3.3 5.2 7.1) (5.3 7.2 8.1) |
  :4 (7.3 9.2 12.1) :8 (5.3 7.2 9.1) (3.3 5.2 7.1) :4 (2.3 3.2 5.1) (0.3 2.2 3.1) |
  :1 (3.3 5.2 7.1)
`;

export interface BarRangeDemoProps {
  showCode?: boolean;
  file?: string;
  tex?: string;
  step?: number;
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
  const texContent = tex ?? DEFAULT_TEX;

  const [api, element] = useAlphaTab((s) => {
    if (file) {
      s.core.file = file;
    } else {
      s.core.tex = true;
    }
    s.display.startBar = 1;
    s.display.barCount = step;
  });

  useAlphaTabEvent(api, "scoreLoaded", (score: alphaTab.model.Score) => {
    setTotalBars(score.masterBars.length);
  });

  useEffect(() => {
    if (api) {
      api.settings.display.startBar = startBar;
      api.settings.display.barCount = barCount;
      api.updateSettings();
      api.render();
    }
  }, [api, startBar, barCount]);

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
      <div ref={element}>{useTex ? texContent : undefined}</div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
