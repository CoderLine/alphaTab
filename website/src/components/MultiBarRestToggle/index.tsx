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

export interface MultiBarRestToggleProps {
  showCode?: boolean;
}

// Pachelbel Canon in D — arpeggio bars 1-2 (D, A), five whole-bar rests
// (the multi-bar-rest target), then arpeggio bars 3-4 (Bm, F#m), then a
// final tonic chord. Pitches 1:1 from Pachelbel's ground+chord tones
// (Seiffert edition, PD; see tex-riffs.ts MULTI_TRACK_ENSEMBLE).
const DEMO_TEX = `\\title "Multi-bar rests"
\\subtitle "Pachelbel Canon in D (PD)"
\\tempo 88
.
\\track "Guitar" "Gtr" \\instrument 24
  :8 0.4 4.4 2.3 3.2 2.3 4.4 2.3 4.4 |
  :8 0.5 4.5 2.4 2.3 2.4 4.5 2.4 4.5 |
  r.1 | r.1 | r.1 | r.1 | r.1 |
  :8 2.5 0.4 4.4 4.3 4.4 0.4 4.4 0.4 |
  :8 4.4 2.3 2.2 7.2 2.2 2.3 2.2 2.3 |
  :1 (0.4 4.4 2.3)
\\track "Bass" "Bs" \\instrument 33
  :1 0.4 | 0.5 |
  r.1 | r.1 | r.1 | r.1 | r.1 |
  :1 2.5 | 4.4 |
  :1 0.4
`;

function ApplyMultiBarRest({ enabled }: { enabled: boolean }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.multiTrackMultiBarRest = enabled;
    }
  );
  useEffect(() => {
    if (api && api.score) {
      api.score.stylesheet.multiTrackMultiBarRest = enabled;
      api.render();
    }
  }, [enabled, api]);
  return null;
}

export const MultiBarRestToggle: React.FC<MultiBarRestToggleProps> = ({
  showCode = true,
}) => {
  const [enabled, setEnabled] = useState(true);
  const site = useSiteAlphaTabSettings({ player: true });

  const code = `api.scoreLoaded.on((score) => {
  score.stylesheet.multiTrackMultiBarRest = ${enabled};
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
          Collapse consecutive empty bars into a multi-bar rest
        </label>
      </div>
      <AlphaTabProvider
        tex={DEMO_TEX}
        tracks="all"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <ApplyMultiBarRest enabled={enabled} />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
