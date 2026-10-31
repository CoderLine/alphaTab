import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import { PlayerProvider, PlayerHost } from "@coderline/alphatab-ui";
import { useAlphaTabApi, useAlphaTabEvent } from "@coderline/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

type Placement = "Top" | "Inline";

export interface ChordDiagramLayoutSwitchProps {
  showCode?: boolean;
}

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
      <PlayerProvider
        file="/files/features/Chords.gp5"
        player={true}
        settings={{ display: { barCount: 12 } }}
      >
        <ApplyPlacement placement={placement} />
        <PlayerHost />
      </PlayerProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
