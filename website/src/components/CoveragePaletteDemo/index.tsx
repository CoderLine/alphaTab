import React, { useMemo, useState } from "react";
import { AlphaTabHost, AlphaTabProvider } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import CodeBlock from "@theme/CodeBlock";

type Field =
  | "mainGlyphColor"
  | "staffLineColor"
  | "barSeparatorColor"
  | "barNumberColor"
  | "scoreInfoColor";

interface PaletteState {
  mainGlyphColor: string;
  staffLineColor: string;
  barSeparatorColor: string;
  barNumberColor: string;
  scoreInfoColor: string;
}

const initial: PaletteState = {
  mainGlyphColor: "#e91e63",
  staffLineColor: "#3f51b5",
  barSeparatorColor: "#3f51b5",
  barNumberColor: "#3f51b5",
  scoreInfoColor: "#3f51b5",
};

export interface CoveragePaletteDemoProps {
  showCode?: boolean;
}

export const CoveragePaletteDemo: React.FC<CoveragePaletteDemoProps> = ({
  showCode = true,
}) => {
  const [palette, setPalette] = useState<PaletteState>(initial);
  const paletteSettings = useMemo(
    () => ({ display: { resources: palette } }),
    [palette],
  );
  const site = useSiteAlphaTabSettings({ settings: paletteSettings });

  const set = (key: Field, value: string) => {
    setPalette((p) => ({ ...p, [key]: value }));
  };

  const fields: { key: Field; label: string }[] = [
    { key: "mainGlyphColor", label: "Main glyph" },
    { key: "staffLineColor", label: "Staff line" },
    { key: "barSeparatorColor", label: "Bar separator" },
    { key: "barNumberColor", label: "Bar numbers" },
    { key: "scoreInfoColor", label: "Score info" },
  ];

  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
  display: {
    resources: {
      mainGlyphColor: '${palette.mainGlyphColor}',
      staffLineColor: '${palette.staffLineColor}',
      barSeparatorColor: '${palette.barSeparatorColor}',
      barNumberColor: '${palette.barNumberColor}',
      scoreInfoColor: '${palette.scoreInfoColor}',
    },
  },
});`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "0.75rem",
          alignItems: "center",
        }}
      >
        {fields.map((f) => (
          <label
            key={f.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
            }}
          >
            <input
              type="color"
              value={palette[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              style={{
                width: "2rem",
                height: "1.75rem",
                border: "none",
                padding: 0,
                background: "transparent",
                cursor: "pointer",
              }}
            />
            {f.label}
          </label>
        ))}
      </div>
      <AlphaTabProvider
        file="/files/features/Chords.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
