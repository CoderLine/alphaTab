import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

export interface HideDynamicsToggleProps {
  showCode?: boolean;
}

function ApplyHideDynamics({ hidden }: { hidden: boolean }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.hideDynamics = hidden;
    },
    [hidden]
  );
  useEffect(() => {
    if (api && api.score) {
      api.score.stylesheet.hideDynamics = hidden;
      api.render();
    }
  }, [api, hidden]);
  return null;
}

export const HideDynamicsToggle: React.FC<HideDynamicsToggleProps> = ({
  showCode = true,
}) => {
  const [hidden, setHidden] = useState(false);

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
            onChange={(e) => setHidden(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Hide dynamics
        </label>
      </div>
      <AlphaTabPlayer
        file="/files/features/Dynamics.gp5"
        player={false}
        settings={{ display: { barCount: 12 } }}
      >
        <ApplyHideDynamics hidden={hidden} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
