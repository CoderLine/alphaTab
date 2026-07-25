import React, { useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

type PolicyName = "Hidden" | "FirstSystem" | "AllSystems";
type ModeName = "FullName" | "ShortName";
type OrientationName = "Horizontal" | "Vertical";

export interface TrackNamePolicyDemoProps {
  showCode?: boolean;
}

const DEMO_TEX = `\\title "Track name policies"
\\tempo 100
.
\\track "Lead Guitar" "Gtr" { instrument 30 }
  :4 (3.3 5.2 7.1) (5.3 7.2 9.1) :2 (7.3 9.2 12.1) |
  :4 (5.3 7.2 8.1) :8 (7.3 9.2 10.1) (5.3 7.2 8.1) :4 (3.3 5.2 7.1) (2.3 3.2 5.1) |
  :8 3.4 5.4 7.4 8.4 10.4 8.4 7.4 5.4 |
  :4 (3.5 5.4 7.3) (5.5 7.4 9.3) :2 (7.5 9.4 12.3)
\\track "Rhythm Bass" "Bs" { instrument 33 }
  :4 3.4 5.4 :2 7.4 |
  :4 5.4 :8 7.4 5.4 :4 3.4 2.4 |
  :8 3.4 5.4 7.4 8.4 :4 7.4 5.4 |
  :4 3.4 5.4 :2 7.4
\\track "Piano Voicing" "Pno"
  \\staff{score} \\tuning piano \\instrument acousticgrandpiano
  :4 (C4 E4 G4) (D4 F4 A4) :2 (E4 G4 B4) |
  :4 (F4 A4 C5) :8 (G4 B4 D5) (F4 A4 C5) :4 (E4 G4 B4) (D4 F4 A4) |
  :4 (C4 E4 G4) :8 (D4 F4 A4) (E4 G4 B4) :4 (F4 A4 C5) (E4 G4 B4) |
  :4 (D4 F4 A4) (C4 E4 G4) :2 (F4 A4 C5)
`;

function ApplyTrackNames({
  policy,
  mode,
  orientation,
}: {
  policy: PolicyName;
  mode: ModeName;
  orientation: OrientationName;
}) {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();
  const applyStylesheet = (score: alphaTab.model.Score) => {
    if (!module) return;
    const s = score.stylesheet;
    s.multiTrackTrackNamePolicy = module.model.TrackNamePolicy[policy];
    s.singleTrackTrackNamePolicy = module.model.TrackNamePolicy[policy];
    s.firstSystemTrackNameMode = module.model.TrackNameMode[mode];
    s.otherSystemsTrackNameMode = module.model.TrackNameMode[mode];
    s.firstSystemTrackNameOrientation =
      module.model.TrackNameOrientation[orientation];
    s.otherSystemsTrackNameOrientation =
      module.model.TrackNameOrientation[orientation];
  };
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      applyStylesheet(score);
    },
    [policy, mode, orientation, module]
  );
  useEffect(() => {
    if (api && api.score) {
      applyStylesheet(api.score);
      api.render();
    }
  }, [policy, mode, orientation, api, module]);
  return null;
}

export const TrackNamePolicyDemo: React.FC<TrackNamePolicyDemoProps> = ({
  showCode = true,
}) => {
  const [policy, setPolicy] = useState<PolicyName>("AllSystems");
  const [mode, setMode] = useState<ModeName>("FullName");
  const [orientation, setOrientation] =
    useState<OrientationName>("Horizontal");

  const code = `api.scoreLoaded.on((score) => {
  const s = score.stylesheet;
  s.multiTrackTrackNamePolicy = alphaTab.model.TrackNamePolicy.${policy};
  s.firstSystemTrackNameMode = alphaTab.model.TrackNameMode.${mode};
  s.otherSystemsTrackNameMode = alphaTab.model.TrackNameMode.${mode};
  s.firstSystemTrackNameOrientation =
    alphaTab.model.TrackNameOrientation.${orientation};
  s.otherSystemsTrackNameOrientation =
    alphaTab.model.TrackNameOrientation.${orientation};
  api.render();
});`;

  const selectStyle: React.CSSProperties = {
    padding: "0.25rem 0.5rem",
    marginLeft: "0.5rem",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "0.75rem",
          alignItems: "center",
        }}
      >
        <label>
          Policy
          <select
            value={policy}
            onChange={(e) => setPolicy(e.target.value as PolicyName)}
            style={selectStyle}
          >
            <option value="Hidden">Hidden</option>
            <option value="FirstSystem">FirstSystem</option>
            <option value="AllSystems">AllSystems</option>
          </select>
        </label>
        <label>
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ModeName)}
            style={selectStyle}
          >
            <option value="FullName">FullName</option>
            <option value="ShortName">ShortName</option>
          </select>
        </label>
        <label>
          Orientation
          <select
            value={orientation}
            onChange={(e) =>
              setOrientation(e.target.value as OrientationName)
            }
            style={selectStyle}
          >
            <option value="Horizontal">Horizontal</option>
            <option value="Vertical">Vertical</option>
          </select>
        </label>
      </div>
      <AlphaTabPlayer tex={DEMO_TEX} tracks="all" player={true}>
        <ApplyTrackNames
          policy={policy}
          mode={mode}
          orientation={orientation}
        />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
