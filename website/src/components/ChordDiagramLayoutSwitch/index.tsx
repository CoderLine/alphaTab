import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from "@coderline/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";

type Placement = "Top" | "Inline";

export interface ChordDiagramLayoutSwitchProps {
  showCode?: boolean;
}

const BAR_COUNT_SETTINGS: alphaTab.json.SettingsJson = { display: { barCount: 12 } };

function ApplyPlacement({ placement }: { placement: Placement }) {
  const api = useAlphaTabApi();
  const apply = (score: alphaTab.model.Score, p: Placement) => {
    score.stylesheet.globalDisplayChordDiagramsOnTop = p === "Top";
    score.stylesheet.globalDisplayChordDiagramsInScore = p === "Inline";
  };
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      apply(score, placement);
    }
  );
  useEffect(() => {
    if (api && api.score) {
      apply(api.score, placement);
      api.render();
    }
  }, [placement, api]);
  return null;
}

export const ChordDiagramLayoutSwitch: React.FC<
  ChordDiagramLayoutSwitchProps
> = ({ showCode = true }) => {
  const [placement, setPlacement] = useState<Placement>("Top");
  const site = useSiteAlphaTabSettings({ player: true, settings: BAR_COUNT_SETTINGS });

  const code = `api.scoreLoaded.on((score) => {
  score.stylesheet.globalDisplayChordDiagramsOnTop = ${placement === "Top"};
  score.stylesheet.globalDisplayChordDiagramsInScore = ${placement === "Inline"};
  api.render();
});`;

  const options: { key: Placement; label: string }[] = [
    { key: "Top", label: "Diagrams on top" },
    { key: "Inline", label: "Diagrams inline" },
  ];

  return (
    <div>
      <ul className="pills" style={{ marginBottom: "0.75rem" }}>
        {options.map((o) => (
          <li
            key={o.key}
            className={`pills__item${
              placement === o.key ? " pills__item--active" : ""
            }`}
            onClick={() => setPlacement(o.key)}
          >
            {o.label}
          </li>
        ))}
      </ul>
      <AlphaTabProvider
        file="/files/features/Chords.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <ApplyPlacement placement={placement} />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
