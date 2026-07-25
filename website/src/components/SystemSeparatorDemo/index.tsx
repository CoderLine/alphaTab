import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

export interface SystemSeparatorDemoProps {
  showCode?: boolean;
}

// Multiple tracks + enough bars to guarantee at least two systems, so the
// separator glyph has a place to appear between them.
const DEMO_TEX = `\\title "System sign separator"
\\tempo 100
.
\\track "Guitar" "Gtr" { instrument 30 }
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1) |
  :8 3.4 5.4 7.4 8.4 10.4 8.4 7.4 5.4 |
  :4 (3.5 5.4 7.3) (5.5 7.4 9.3) :2 (7.5 9.4 12.3) |
  :4 5.6 7.6 8.6 10.6 |
  :4 (3.3 5.2 7.1) (5.3 7.2 8.1) :2 (3.3 5.2 7.1) |
  :8 12.4 10.4 8.4 7.4 5.4 3.4 2.4 0.4 |
  :4 (0.6 2.5 3.4) (3.6 5.5 7.4) :2 (5.6 7.5 8.4)
\\track "Bass" "Bs" { instrument 33 }
  :4 3.4 5.4 :2 7.4 |
  :4 5.4 :8 7.4 5.4 :4 3.4 2.4 |
  :8 3.4 5.4 7.4 8.4 :4 7.4 5.4 |
  :4 3.4 5.4 :2 7.4 |
  :4 5.4 :8 7.4 5.4 :4 3.4 2.4 |
  :4 3.4 5.4 :2 7.4 |
  :8 3.4 5.4 7.4 8.4 :4 7.4 5.4 |
  :4 3.4 5.4 :2 7.4
`;

function ApplySystemSeparator({ enabled }: { enabled: boolean }) {
  const api = useAlphaTabApi();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      score.stylesheet.useSystemSignSeparator = enabled;
    },
    [enabled]
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
      <AlphaTabPlayer tex={DEMO_TEX} tracks="all" player={true}>
        <ApplySystemSeparator enabled={enabled} />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
