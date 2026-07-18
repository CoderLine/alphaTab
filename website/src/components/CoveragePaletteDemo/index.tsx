import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab } from "@site/src/hooks";
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
  const [api, element] = useAlphaTab((s) => {
    s.core.file = "/files/features/Chords.gp5";
    s.display.resources.mainGlyphColor =
      alphaTab.model.Color.fromJson(initial.mainGlyphColor)!;
    s.display.resources.staffLineColor =
      alphaTab.model.Color.fromJson(initial.staffLineColor)!;
    s.display.resources.barSeparatorColor =
      alphaTab.model.Color.fromJson(initial.barSeparatorColor)!;
    s.display.resources.barNumberColor =
      alphaTab.model.Color.fromJson(initial.barNumberColor)!;
    s.display.resources.scoreInfoColor =
      alphaTab.model.Color.fromJson(initial.scoreInfoColor)!;
  });

  useEffect(() => {
    if (api) {
      const r = api.settings.display.resources;
      r.mainGlyphColor =
        alphaTab.model.Color.fromJson(palette.mainGlyphColor)!;
      r.staffLineColor =
        alphaTab.model.Color.fromJson(palette.staffLineColor)!;
      r.barSeparatorColor =
        alphaTab.model.Color.fromJson(palette.barSeparatorColor)!;
      r.barNumberColor =
        alphaTab.model.Color.fromJson(palette.barNumberColor)!;
      r.scoreInfoColor =
        alphaTab.model.Color.fromJson(palette.scoreInfoColor)!;
      api.updateSettings();
      api.render();
    }
  }, [palette, api]);

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
  core: { file: '/scores/canon.gp' },
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
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
