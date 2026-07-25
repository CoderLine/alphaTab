import React, { useEffect, useState } from "react";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabControls,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
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

function ApplyPalette({ palette }: { palette: PaletteState }) {
  const api = useAlphaTabApi();
  const controls = useAlphaTabControls();
  const module = useAlphaTabModule();
  useEffect(() => {
    if (!api || !controls || !module) return;
    const r = api.settings.display.resources;
    r.mainGlyphColor = module.model.Color.fromJson(palette.mainGlyphColor)!;
    r.staffLineColor = module.model.Color.fromJson(palette.staffLineColor)!;
    r.barSeparatorColor = module.model.Color.fromJson(
      palette.barSeparatorColor
    )!;
    r.barNumberColor = module.model.Color.fromJson(palette.barNumberColor)!;
    r.scoreInfoColor = module.model.Color.fromJson(palette.scoreInfoColor)!;
    controls.updateSettings();
  }, [api, controls, module, palette]);
  return null;
}

export const CoveragePaletteDemo: React.FC<CoveragePaletteDemoProps> = ({
  showCode = true,
}) => {
  const [palette, setPalette] = useState<PaletteState>(initial);

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
      <AlphaTabPlayer
        file="/files/features/Chords.gp5"
        player={true}
        settings={{
          display: {
            resources: {
              mainGlyphColor: initial.mainGlyphColor,
              staffLineColor: initial.staffLineColor,
              barSeparatorColor: initial.barSeparatorColor,
              barNumberColor: initial.barNumberColor,
              scoreInfoColor: initial.scoreInfoColor,
            },
          },
        }}
      >
        <ApplyPalette palette={palette} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
