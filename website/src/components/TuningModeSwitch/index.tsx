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
  const module = useAlphaTabModule();
  const apply = (score: alphaTab.model.Score) => {
    if (!module) return;
    const s = score.stylesheet;
    s.globalDisplayTuning = !hidden;
    s.tuningDisplayMode = module.model.TuningDisplayMode[mode];
  };
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      apply(score);
    },
    [mode, hidden, module]
  );
  useEffect(() => {
    if (api && api.score) {
      apply(api.score);
      api.render();
    }
  }, [mode, hidden, api, module]);
  return null;
}

export const TuningModeSwitch: React.FC<TuningModeSwitchProps> = ({
  showCode = true,
}) => {
  const [mode, setMode] = useState<ModeName>("Score");
  const [hidden, setHidden] = useState(false);

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
      <AlphaTabPlayer
        file="/files/features/Tuning.gp5"
        player={false}
        settings={{ display: { barCount: 12 } }}
      >
        <ApplyTuning mode={mode} hidden={hidden} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
