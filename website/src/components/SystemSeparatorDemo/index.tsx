import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEvent,
} from "@coderline/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";

export interface SystemSeparatorDemoProps {
  showCode?: boolean;
}

// Multiple tracks + enough bars to guarantee at least two systems, so the
// separator glyph has a place to appear between them.
import { MULTI_TRACK_ENSEMBLE } from "@site/src/tex-riffs";

// Default sample: Pachelbel Canon in D 8-bar ensemble (PD, see tex-riffs.ts).
const DEMO_TEX = MULTI_TRACK_ENSEMBLE;

function ApplySystemSeparator({ enabled }: { enabled: boolean }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.useSystemSignSeparator = enabled;
    }
  );
  useEffect(() => {
    if (api && api.score) {
      api.score.stylesheet.useSystemSignSeparator = enabled;
      api.render();
    }
  }, [enabled, api]);
  return null;
}

export const SystemSeparatorDemo: React.FC<SystemSeparatorDemoProps> = ({
  showCode = true,
}) => {
  const [enabled, setEnabled] = useState(true);
  const site = useSiteAlphaTabSettings({ player: true });

  const code = `api.scoreLoaded.on((score) => {
  score.stylesheet.useSystemSignSeparator = ${enabled};
  api.render();
});`;

  return (
    <div>
      <div style={{ marginBottom: "0.75rem" }}>
        <label style={{ cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Show system separator
        </label>
      </div>
      <AlphaTabProvider
        tex={DEMO_TEX}
        tracks="all"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <ApplySystemSeparator enabled={enabled} />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
