import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from "@coderline/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";

type ModeName = "NoBrackets" | "GroupStaves" | "GroupSimilarInstruments";

export interface BracketModeSwitchProps {
  showCode?: boolean;
}

import { MULTI_TRACK_ENSEMBLE } from "@site/src/tex-riffs";

// Default sample: Pachelbel Canon in D 8-bar ensemble (PD, see tex-riffs.ts).
const DEMO_TEX = MULTI_TRACK_ENSEMBLE;

function ApplyBracketMode({ mode }: { mode: ModeName }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.bracketExtendMode = alphaTab.model.BracketExtendMode[mode];
    }
  );
  useEffect(() => {
    if (api && api.score) {
      api.score.stylesheet.bracketExtendMode =
        alphaTab.model.BracketExtendMode[mode];
      api.render();
    }
  }, [mode, api]);
  return null;
}

export const BracketModeSwitch: React.FC<BracketModeSwitchProps> = ({
  showCode = true,
}) => {
  const [mode, setMode] = useState<ModeName>("GroupStaves");
  const site = useSiteAlphaTabSettings();

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
      <AlphaTabProvider
        tex={DEMO_TEX}
        tracks="all"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <ApplyBracketMode mode={mode} />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
