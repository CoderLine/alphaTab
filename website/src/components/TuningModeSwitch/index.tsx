import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEvent,
} from '@coderline/alphatab-react';
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';

type ModeName = "Score" | "Staff";

export interface TuningModeSwitchProps {
  showCode?: boolean;
}

function ApplyTuning({
  mode,
  hidden,
}: {
  mode: ModeName;
  hidden: boolean;
}) {
  const api = useAlphaTabApi();
  const apply = (score: alphaTab.model.Score) => {
    const s = score.stylesheet;
    s.globalDisplayTuning = !hidden;
    s.tuningDisplayMode = alphaTab.model.TuningDisplayMode[mode];
  };
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      apply(score);
    }
  );
  useEffect(() => {
    if (api && api.score) {
      apply(api.score);
      api.render();
    }
  }, [mode, hidden, api]);
  return null;
}

export const TuningModeSwitch: React.FC<TuningModeSwitchProps> = ({
  showCode = true,
}) => {
  const [mode, setMode] = useState<ModeName>("Score");
  const [hidden, setHidden] = useState(false);
  const site = useSiteAlphaTabSettings({
    settings: { display: { barCount: 12 } },
  });

  const code = `api.scoreLoaded.on((score) => {
  score.stylesheet.globalDisplayTuning = ${!hidden};
  score.stylesheet.tuningDisplayMode =
    alphaTab.model.TuningDisplayMode.${mode};
  api.render();
});`;

  const modes: { key: ModeName; label: string }[] = [
    { key: "Score", label: "Score (block above)" },
    { key: "Staff", label: "Staff (next to lines)" },
  ];

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
        <ul className="pills" style={{ margin: 0 }}>
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
        <label style={{ cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Hide tuning globally
        </label>
      </div>
      <AlphaTabProvider
        file="/files/features/Tuning.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <ApplyTuning mode={mode} hidden={hidden} />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
