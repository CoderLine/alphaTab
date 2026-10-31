import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabControls,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

type ElementKey =
  | "ScoreTitle"
  | "GuitarTuning"
  | "BarNumber"
  | "EffectWhammyBar"
  | "EffectDynamics"
  | "EffectPalmMute";

interface Toggle {
  key: ElementKey;
  label: string;
}

const toggles: Toggle[] = [
  { key: "ScoreTitle", label: "Score title" },
  { key: "GuitarTuning", label: "Guitar tuning" },
  { key: "BarNumber", label: "Bar numbers" },
  { key: "EffectWhammyBar", label: "Whammy band" },
  { key: "EffectDynamics", label: "Dynamics" },
  { key: "EffectPalmMute", label: "Palm-mute brackets" },
];

export interface ToggleElementsDemoProps {
  showCode?: boolean;
}

// Tex that exercises every toggle: title/subtitle, guitar tuning,
// bar numbers (from the second bar onward), whammy bar, dynamics,
// palm-mute bracket.
const DEMO_TEX = `\\title "Toggle catalogue"
\\subtitle "Every element the map controls"
\\tempo 100
.
\\track "Guitar"
  :4 3.3{ dy pp } 5.3 7.3 8.3 |
  :8 10.3{ pm } 10.3{ pm } 10.3{ pm } 10.3{ pm } :4 (7.3 8.2 10.1){ dy ff } |
  :4 12.3{ tb (0 4 0) } 10.3 :2 8.3 |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1)
`;

function ApplyElementVisibility({
  visibility,
}: {
  visibility: Record<ElementKey, boolean>;
}) {
  const api = useAlphaTabApi();
  const controls = useAlphaTabControls();
  const module = useAlphaTabModule();
  useEffect(() => {
    if (!api || !controls || !module) { return; }
    const map = api.settings.notation.elements;
    for (const t of toggles) {
      map.set(
        module.NotationElement[t.key] as alphaTab.NotationElement,
        visibility[t.key]
      );
    }
    controls.updateSettings();
  }, [api, controls, module, visibility]);
  return null;
}

export const ToggleElementsDemo: React.FC<ToggleElementsDemoProps> = ({
  showCode = true,
}) => {
  const [visibility, setVisibility] = useState<Record<ElementKey, boolean>>({
    ScoreTitle: true,
    GuitarTuning: true,
    BarNumber: true,
    EffectWhammyBar: true,
    EffectDynamics: true,
    EffectPalmMute: true,
  });

  const flip = (key: ElementKey) => {
    setVisibility((v) => ({ ...v, [key]: !v[key] }));
  };

  const disabledEntries = toggles
    .filter((t) => !visibility[t.key])
    .map((t) => `  [alphaTab.NotationElement.${t.key}, false],`)
    .join("\n");

  const code = `const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
  notation: {
    elements: new Map([
${disabledEntries || "      // every element visible"}
    ]),
  },
});`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem 1.25rem",
          marginBottom: "0.75rem",
        }}
      >
        {toggles.map((t) => (
          <label
            key={t.key}
            style={{
              cursor: "pointer",
              userSelect: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <input
              type="checkbox"
              checked={visibility[t.key]}
              onChange={() => flip(t.key)}
            />
            {t.label}
          </label>
        ))}
      </div>
      <AlphaTabPlayer tex={DEMO_TEX} player={true}>
        <ApplyElementVisibility visibility={visibility} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
