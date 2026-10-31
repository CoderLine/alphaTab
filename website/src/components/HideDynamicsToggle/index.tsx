import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from "@coderline/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";

export interface HideDynamicsToggleProps {
  showCode?: boolean;
}

const BAR_COUNT_SETTINGS: alphaTab.json.SettingsJson = { display: { barCount: 12 } };

function ApplyHideDynamics({ hidden }: { hidden: boolean }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.hideDynamics = hidden;
    }
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
  const site = useSiteAlphaTabSettings({ player: true, settings: BAR_COUNT_SETTINGS });

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
      <AlphaTabProvider
        file="/files/features/Dynamics.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <ApplyHideDynamics hidden={hidden} />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
