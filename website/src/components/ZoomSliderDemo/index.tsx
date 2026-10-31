import React, { useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { PlayerProvider, PlayerHost, usePlayerControls } from "@coderline/alphatab-ui";
import { FOLK_ARPEGGIO } from "@site/src/tex-riffs";

export interface ZoomSliderDemoProps {
  showCode?: boolean;
  file?: string;
  tex?: string;
}

// Default sample: Bach, WTC I Prelude in C major BWV 846 bars 5–8 —
// PD arpeggio-per-bar shape with strong chord context on every note.
// See src/tex-riffs.ts for pitch verification.
const DEFAULT_TEX = FOLK_ARPEGGIO;

function ApplyScale({ scale }: { scale: number }) {
  const controls = usePlayerControls();
  useEffect(() => {
    if (controls) {
      controls.setScale(scale);
    }
  }, [controls, scale]);
  return null;
}

export const ZoomSliderDemo: React.FC<ZoomSliderDemoProps> = ({
  showCode = true,
  file,
  tex,
}) => {
  const [scale, setScale] = useState(1.3);
  const [pendingScale, setPendingScale] = useState(1.3);

  // Debounce: only apply zoom after the user pauses moving the slider.
  useEffect(() => {
    const handle = window.setTimeout(() => setScale(pendingScale), 200);
    return () => window.clearTimeout(handle);
  }, [pendingScale]);

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

  const texContent = file ? undefined : tex ?? DEFAULT_TEX;

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
        style={{
          transition: "opacity 120ms ease",
          opacity: pendingScale === scale ? 1 : 0.6,
        }}
      >
        <PlayerProvider
          file={file}
          tex={texContent}
          player={true}
          settings={{ display: { scale: 1.3 } }}
        >
          <ApplyScale scale={scale} />
          <PlayerHost />
        </PlayerProvider>
      </div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
