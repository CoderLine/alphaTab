import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

type ModeName = "NoBrackets" | "GroupStaves" | "GroupSimilarInstruments";

export interface BracketModeSwitchProps {
  showCode?: boolean;
}

const DEMO_TEX = `\\title "Bracket grouping"
\\tempo 100
.
\\track "Guitar 1" "Gtr1" { instrument 30 }
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1)
\\track "Guitar 2" "Gtr2" { instrument 30 }
  :4 3.3 5.3 :2 7.3 |
  :4 5.3 :8 7.3 5.3 :4 3.3 2.3
\\track "Bass" "Bs" { instrument 33 }
  :4 3.4 3.4 :2 3.4 |
  :4 5.4 :8 5.4 5.4 :4 3.4 2.4
\\track "Piano" "Pno"
  \\staff{score} \\tuning piano \\instrument acousticgrandpiano
  :4 (C4 E4 G4) (D4 F4 A4) :2 (E4 G4 B4) |
  :4 (F4 A4 C5) :8 (G4 B4 D5) (F4 A4 C5) :4 (E4 G4 B4) (D4 F4 A4)
  \\staff{score} \\tuning piano \\clef F4
  :4 C3 G3 :2 C3 |
  :4 F3 :8 G3 F3 :4 E3 D3
`;

function ApplyBracketMode({ mode }: { mode: ModeName }) {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      if (!module) return;
      score.stylesheet.bracketExtendMode = module.model.BracketExtendMode[mode];
    },
    [mode, module]
  );
  useEffect(() => {
    if (api && api.score && module) {
      api.score.stylesheet.bracketExtendMode =
        module.model.BracketExtendMode[mode];
      api.render();
    }
  }, [mode, api, module]);
  return null;
}

export const BracketModeSwitch: React.FC<BracketModeSwitchProps> = ({
  showCode = true,
}) => {
  const [mode, setMode] = useState<ModeName>("GroupStaves");

  const code = `api.scoreLoaded.on((score) => {
  score.stylesheet.bracketExtendMode =
    alphaTab.model.BracketExtendMode.${mode};
  api.render();
});`;

  const modes: { key: ModeName; label: string }[] = [
    { key: "NoBrackets", label: "NoBrackets" },
    { key: "GroupStaves", label: "GroupStaves" },
    { key: "GroupSimilarInstruments", label: "GroupSimilarInstruments" },
  ];

  return (
    <div>
      <ul className="pills" style={{ marginBottom: "0.75rem" }}>
        {modes.map((m) => (
          <li
            key={m.key}
            className={`pills__item${
              mode === m.key ? " pills__item--active" : ""
            }`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </li>
        ))}
      </ul>
      <AlphaTabPlayer tex={DEMO_TEX} tracks="all" player={true}>
        <ApplyBracketMode mode={mode} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
