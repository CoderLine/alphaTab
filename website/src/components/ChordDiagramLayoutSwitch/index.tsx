import React, { useEffect, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import CodeBlock from "@theme/CodeBlock";

type Placement = "Top" | "Inline";

export interface ChordDiagramLayoutSwitchProps {
  showCode?: boolean;
}

export const ChordDiagramLayoutSwitch: React.FC<
  ChordDiagramLayoutSwitchProps
> = ({ showCode = true }) => {
  const [placement, setPlacement] = useState<Placement>("Top");
  const [api, element] = useAlphaTab((s) => {
    s.core.file = "/files/features/Chords.gp5";
    s.display.barCount = 12;
  });

  const applyPlacement = (score: alphaTab.model.Score, p: Placement) => {
    score.stylesheet.globalDisplayChordDiagramsOnTop = p === "Top";
    score.stylesheet.globalDisplayChordDiagramsInScore = p === "Inline";
  };

  useAlphaTabEvent(
    api,
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      applyPlacement(score, placement);
    },
    [placement]
  );

  useEffect(() => {
    if (api && api.score) {
      applyPlacement(api.score, placement);
      api.render();
    }
  }, [placement, api]);

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
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
