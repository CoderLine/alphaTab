import React, { useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab } from "@site/src/hooks";

export interface ZoomSliderDemoProps {
  showCode?: boolean;
  file?: string;
  tex?: string;
}

const DEFAULT_TEX = `\\title "Zoom demo"
\\tempo 100
.
\\track "Guitar"
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1)
`;

export const ZoomSliderDemo: React.FC<ZoomSliderDemoProps> = ({
  showCode = true,
  file,
  tex,
}) => {
  const [scale, setScale] = useState(1.3);
  const [pendingScale, setPendingScale] = useState(1.3);

  const [api, element] = useAlphaTab((s) => {
    if (file) {
      s.core.file = file;
    } else {
      s.core.tex = true;
    }
    s.display.scale = 1.3;
  });

  // Debounce: only apply zoom after the user pauses moving the slider.
  useEffect(() => {
    const handle = window.setTimeout(() => setScale(pendingScale), 200);
    return () => window.clearTimeout(handle);
  }, [pendingScale]);

  useEffect(() => {
    if (api) {
      api.settings.display.scale = scale;
      api.updateSettings();
      api.render();
    }
  }, [api, scale]);

  const code = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
  display: { scale: 1.0 },
});

const slider = document.getElementById('zoom');
slider.addEventListener('change', (event) => {
  api.settings.display.scale = Number(event.target.value);
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
        <label htmlFor="zoom-slider-demo" style={{ fontWeight: 600 }}>
          Zoom
        </label>
        <input
          id="zoom-slider-demo"
          type="range"
          min={0.5}
          max={2.0}
          step={0.05}
          value={pendingScale}
          onChange={(e) => setPendingScale(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span
          style={{
            minWidth: "3.5rem",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(pendingScale * 100)}%
        </span>
      </div>
      <div
        ref={element}
        style={{
          transition: "opacity 120ms ease",
          opacity: pendingScale === scale ? 1 : 0.6,
        }}
      >
        {file ? undefined : tex ?? DEFAULT_TEX}
      </div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
