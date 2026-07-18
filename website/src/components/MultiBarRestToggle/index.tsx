import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

export interface MultiBarRestToggleProps {
  showCode?: boolean;
}

// Both tracks share the same 10-bar structure. Bars 3-7 are empty on every
// track so the multi-bar rest can collapse them when the flag is on.
const DEMO_TEX = `\\title "Multi-bar rests"
\\tempo 100
.
\\track "Guitar" "Gtr" { instrument 30 }
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1) |
  r.1 | r.1 | r.1 | r.1 | r.1 |
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1) |
  :1 (3.3 5.2 7.1)
\\track "Bass" "Bs" { instrument 33 }
  :4 3.4 5.4 :2 7.4 |
  :4 5.4 :8 7.4 5.4 :4 3.4 2.4 |
  r.1 | r.1 | r.1 | r.1 | r.1 |
  :4 3.4 5.4 :2 7.4 |
  :4 5.4 :8 7.4 5.4 :4 3.4 2.4 |
  :1 3.4
`;

function ApplyMultiBarRest({ enabled }: { enabled: boolean }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.multiTrackMultiBarRest = enabled;
    },
    [enabled]
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
      <AlphaTabPlayer tex={DEMO_TEX} tracks="all" player={false}>
        <ApplyMultiBarRest enabled={enabled} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
