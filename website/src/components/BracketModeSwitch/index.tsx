import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import { PlayerProvider, PlayerHost } from "@coderline/alphatab-ui";
import { useAlphaTabApi, useAlphaTabEvent } from "@coderline/alphatab-react";
import { useAlphaTabModule } from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

type ModeName = "NoBrackets" | "GroupStaves" | "GroupSimilarInstruments";

export interface BracketModeSwitchProps {
  showCode?: boolean;
}

import { MULTI_TRACK_ENSEMBLE } from "@site/src/tex-riffs";

// Default sample: Pachelbel Canon in D 8-bar ensemble (PD, see tex-riffs.ts).
const DEMO_TEX = MULTI_TRACK_ENSEMBLE;

function ApplyBracketMode({ mode }: { mode: ModeName }) {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      if (!module) { return; }
      score.stylesheet.bracketExtendMode = module.model.BracketExtendMode[mode];
    }
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
      <PlayerProvider tex={DEMO_TEX} tracks="all" player={true}>
        <ApplyBracketMode mode={mode} />
        <PlayerHost />
      </PlayerProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
