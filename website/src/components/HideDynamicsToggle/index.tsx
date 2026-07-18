import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import CodeBlock from "@theme/CodeBlock";

export interface HideDynamicsToggleProps {
  showCode?: boolean;
}

export const HideDynamicsToggle: React.FC<HideDynamicsToggleProps> = ({
  showCode = true,
}) => {
  const [hidden, setHidden] = useState(false);
  const [api, element] = useAlphaTab((s) => {
    s.core.file = "/files/features/Dynamics.gp5";
    s.display.barCount = 12;
  });

  useAlphaTabEvent(
    api,
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.hideDynamics = hidden;
    },
    [hidden]
  );

  const toggle = (next: boolean) => {
    setHidden(next);
    if (api && api.score) {
      api.score.stylesheet.hideDynamics = next;
      api.render();
    }
  };

  const code = `api.scoreLoaded.on((score) => {
  score.stylesheet.hideDynamics = ${hidden};
  api.render();
});`;

  return (
    <div>
      <div style={{ marginBottom: "0.75rem" }}>
        <label style={{ cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => toggle(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Hide dynamics
        </label>
      </div>
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
