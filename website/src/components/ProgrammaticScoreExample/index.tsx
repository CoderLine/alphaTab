import { useAlphaTab } from "@site/src/hooks";
import React, { useEffect } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";

export interface ProgrammaticScoreExampleProps {
  showCode?: boolean;
}

function buildScore(settings: alphaTab.Settings): alphaTab.model.Score {
  const score = new alphaTab.model.Score();
  score.title = "Built in code";

  // Two shared master bars in 4/4. The initial tempo lives on the first
  // master bar as a tempo automation — Score.tempo itself is derived.
  for (let i = 0; i < 2; i++) {
    const masterBar = new alphaTab.model.MasterBar();
    masterBar.timeSignatureNumerator = 4;
    masterBar.timeSignatureDenominator = 4;
    score.addMasterBar(masterBar);
  }
  score.masterBars[0].tempoAutomations.push(
    alphaTab.model.Automation.buildTempoAutomation(false, 0, 120, 2),
  );

  // One guitar track, one staff, standard six-string tuning (high E → low E).
  const track = new alphaTab.model.Track();
  track.name = "Guitar";
  track.shortName = "Gtr";
  score.addTrack(track);

  const staff = new alphaTab.model.Staff();
  staff.stringTuning.tunings = [64, 59, 55, 50, 45, 40];
  track.addStaff(staff);

  // One bar per master bar, one voice per bar.
  for (let i = 0; i < score.masterBars.length; i++) {
    const bar = new alphaTab.model.Bar();
    staff.addBar(bar);

    const voice = new alphaTab.model.Voice();
    bar.addVoice(voice);

    // Four quarter-note beats per bar, ascending then descending the third string.
    // Note.string is 1-based counted from the lowest string.
    const frets = i === 0 ? [3, 5, 7, 8] : [8, 7, 5, 3];
    for (const fret of frets) {
      const beat = new alphaTab.model.Beat();
      beat.duration = alphaTab.model.Duration.Quarter;
      voice.addBeat(beat);

      const note = new alphaTab.model.Note();
      note.string = 4;
      note.fret = fret;
      beat.addNote(note);
    }
  }

  // Finalize the tree — computes ties, tick positions, and other derived state.
  score.finish(settings);
  return score;
}

const codeSample = `import * as alphaTab from '@coderline/alphatab';

const score = new alphaTab.model.Score();
score.title = 'Built in code';

// Two shared master bars — 4/4 time.
for (let i = 0; i < 2; i++) {
  const masterBar = new alphaTab.model.MasterBar();
  masterBar.timeSignatureNumerator = 4;
  masterBar.timeSignatureDenominator = 4;
  score.addMasterBar(masterBar);
}

// Score.tempo is derived from the tempo automation on the first master bar.
score.masterBars[0].tempoAutomations.push(
  alphaTab.model.Automation.buildTempoAutomation(false, 0, 120, 2),
);

// One guitar track, one staff, standard six-string tuning (high E → low E).
const track = new alphaTab.model.Track();
track.name = 'Guitar';
track.shortName = 'Gtr';
score.addTrack(track);

const staff = new alphaTab.model.Staff();
staff.stringTuning.tunings = [64, 59, 55, 50, 45, 40];
track.addStaff(staff);

for (let i = 0; i < score.masterBars.length; i++) {
  const bar = new alphaTab.model.Bar();
  staff.addBar(bar);

  const voice = new alphaTab.model.Voice();
  bar.addVoice(voice);

  const frets = i === 0 ? [3, 5, 7, 8] : [8, 7, 5, 3];
  for (const fret of frets) {
    const beat = new alphaTab.model.Beat();
    beat.duration = alphaTab.model.Duration.Quarter;
    voice.addBeat(beat);

    const note = new alphaTab.model.Note();
    note.string = 4;
    note.fret = fret;
    beat.addNote(note);
  }
}

// Compute ties, tick positions, and other derived state before rendering.
score.finish(api.settings);

api.renderScore(score);
`;

export const ProgrammaticScoreExample: React.FC<ProgrammaticScoreExampleProps> = ({
  showCode = true,
}) => {
  const [api, element] = useAlphaTab((s) => {});

  useEffect(() => {
    if (api) {
      api.renderScore(buildScore(api.settings));
    }
  }, [api]);

  return (
    <div>
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{codeSample}</CodeBlock> : null}
    </div>
  );
};
