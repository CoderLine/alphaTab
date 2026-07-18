import React, { useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab } from "@site/src/hooks";

export interface SpacingSlidersDemoProps {
  showCode?: boolean;
  file?: string;
}

export const SpacingSlidersDemo: React.FC<SpacingSlidersDemoProps> = ({
  showCode = true,
  file = "/files/features/Chords.gp5",
}) => {
  const [stretchForce, setStretchForce] = useState(1.2);
  const [spacingRatio, setSpacingRatio] = useState(1.5);
  const [lastSystemFillThreshold, setLastSystemFillThreshold] = useState(0.5);

  const [api, element] = useAlphaTab((s) => {
    s.core.file = file;
    s.display.stretchForce = 1.2;
    s.display.spacingRatio = 1.5;
    s.display.lastSystemFillThreshold = 0.5;
  });

  useEffect(() => {
    if (api) {
      api.settings.display.stretchForce = stretchForce;
      api.settings.display.spacingRatio = spacingRatio;
      api.settings.display.lastSystemFillThreshold = lastSystemFillThreshold;
      api.updateSettings();
      api.render();
    }
  }, [api, stretchForce, spacingRatio, lastSystemFillThreshold]);

  const code = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
  display: {
    stretchForce: ${stretchForce.toFixed(2)},
    spacingRatio: ${spacingRatio.toFixed(2)},
    lastSystemFillThreshold: ${lastSystemFillThreshold.toFixed(2)},
  },
});`;

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "10rem 1fr 4rem",
    alignItems: "center",
    gap: "1rem",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "0.75rem",
          padding: "0.75rem",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "6px",
          background: "var(--ifm-background-surface-color)",
        }}
      >
        <div style={rowStyle}>
          <label htmlFor="stretch-force" style={{ fontWeight: 600 }}>
            stretchForce
          </label>
          <input
            id="stretch-force"
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={stretchForce}
            onChange={(e) => setStretchForce(Number(e.target.value))}
          />
          <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
            {stretchForce.toFixed(2)}
          </span>
        </div>
        <div style={rowStyle}>
          <label htmlFor="spacing-ratio" style={{ fontWeight: 600 }}>
            spacingRatio
          </label>
          <input
            id="spacing-ratio"
            type="range"
            min={1.2}
            max={2.0}
            step={0.02}
            value={spacingRatio}
            onChange={(e) => setSpacingRatio(Number(e.target.value))}
          />
          <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
            {spacingRatio.toFixed(2)}
          </span>
        </div>
        <div style={rowStyle}>
          <label htmlFor="fill-threshold" style={{ fontWeight: 600 }}>
            lastSystemFillThreshold
          </label>
          <input
            id="fill-threshold"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={lastSystemFillThreshold}
            onChange={(e) => setLastSystemFillThreshold(Number(e.target.value))}
          />
          <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
            {lastSystemFillThreshold.toFixed(2)}
          </span>
        </div>
      </div>
      <div ref={element} />
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
