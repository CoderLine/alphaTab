import React from "react";
import type * as alphaTab from "@coderline/alphatab";
import { PlayerProvider, PlayerHost } from "@coderline/alphatab-ui";
import { useAlphaTabEvent } from "@coderline/alphatab-react";
import { useAlphaTabModule } from "@site/src/alphatab-react";
import * as Riffs from "@site/src/tex-riffs";
import CodeBlock from "@theme/CodeBlock";

export interface ColoringExampleProps {
  showCode?: boolean;
}

const TEX = Riffs.GREENSLEEVES;

function ApplyColors() {
  const module = useAlphaTabModule();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      if (!module) { return; }
      // create custom style on score level
      score.style = new module.model.ScoreStyle();
      score.style.colors.set(
        module.model.ScoreSubElement.Title,
        module.model.Color.fromJson("#426d9d")!
      );
      score.style.colors.set(
        module.model.ScoreSubElement.SubTitle,
        module.model.Color.fromJson("#4cb3d4")!
      );

      const fretColors: Record<number, alphaTab.model.Color> = {
        3: module.model.Color.fromJson("#d13a3a")!,
        4: module.model.Color.fromJson("#e17722")!,
        5: module.model.Color.fromJson("#e1a90e")!,
        7: module.model.Color.fromJson("#6abd45")!,
        8: module.model.Color.fromJson("#70ccd6")!,
        10: module.model.Color.fromJson("#3953a5")!,
        12: module.model.Color.fromJson("#ab519f")!,
        13: module.model.Color.fromJson("#d047a3")!,
      };

      // traverse hierarchy and apply colors as desired
      for (const track of score.tracks) {
        for (const staff of track.staves) {
          for (const bar of staff.bars) {
            for (const voice of bar.voices) {
              for (const beat of voice.beats) {
                // on tuplets colors beam and tuplet bracket
                if (beat.hasTuplet) {
                  beat.style = new module.model.BeatStyle();
                  const color = module.model.Color.fromJson("#00DD00")!;
                  beat.style.colors.set(
                    module.model.BeatSubElement.StandardNotationTuplet,
                    color
                  );
                  beat.style.colors.set(
                    module.model.BeatSubElement.StandardNotationBeams,
                    color
                  );
                }

                for (const note of beat.notes) {
                  // color notes based on the fret
                  note.style = new module.model.NoteStyle();
                  const c = fretColors[note.fret];
                  if (c) {
                    note.style.colors.set(
                      module.model.NoteSubElement.StandardNotationNoteHead,
                      c
                    );
                    note.style.colors.set(
                      module.model.NoteSubElement.GuitarTabFretNumber,
                      c
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  );
  return null;
}

export const ColoringExample: React.FC<ColoringExampleProps> = ({
  showCode = true,
}) => {
  const codeLines = `
  const api = new alphaTab.AlphaTabApi(...);
  api.scoreLoaded.on(score => applyColors(score));
  function applyColors(score) {
    // create custom style on score level
    score.style = new alphaTab.model.ScoreStyle();
    score.style.colors.set(
      alphaTab.model.ScoreSubElement.Title,
      alphaTab.model.Color.fromJson("#426d9d")
    );
    score.style.colors.set(
      alphaTab.model.ScoreSubElement.SubTitle,
      alphaTab.model.Color.fromJson("#4cb3d4")
    );

    const fretColors = {
        3: alphaTab.model.Color.fromJson("#d13a3a"),
        4: alphaTab.model.Color.fromJson("#e17722"),
        5: alphaTab.model.Color.fromJson("#e1a90e"),
        7: alphaTab.model.Color.fromJson("#6abd45"),
        8: alphaTab.model.Color.fromJson("#70ccd6"),
        10: alphaTab.model.Color.fromJson("#3953a5"),
        12: alphaTab.model.Color.fromJson("#ab519f"),
        13: alphaTab.model.Color.fromJson("#d047a3")
    };

    // traverse hierarchy and apply colors as desired
    for (const track of score.tracks) {
      for (const staff of track.staves) {
        for (const bar of staff.bars) {
          for (const voice of bar.voices) {
            for (const beat of voice.beats) {
              // on tuplets colors beam and tuplet bracket
              if (beat.hasTuplet) {
                beat.style = new alphaTab.model.BeatStyle();
                const color = alphaTab.model.Color.fromJson("#00DD00");
                beat.style.colors.set(
                  alphaTab.model.BeatSubElement.StandardNotationTuplet,
                  color
                );
                beat.style.colors.set(
                  alphaTab.model.BeatSubElement.StandardNotationBeams,
                  color
                );
              }

              for (const note of beat.notes) {
                // color notes based on the fret
                note.style = new alphaTab.model.NoteStyle();
                note.style.colors.set(alphaTab.model.NoteSubElement.StandardNotationNoteHead,
                    fretColors[note.fret]
                );
                note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber,
                    fretColors[note.fret]
                );
              }
            }
          }
        }
      }
    }
  }

  `.split("\n");

  const indent =
    codeLines.find((l) => l.length > 0)?.match(/^([ ]+).*/)?.[1]?.length ?? 0;

  const trimmed = codeLines
    .map((l) => l.substring(indent))
    .join("\n")
    .trim();

  return (
    <div>
      <PlayerProvider tex={TEX} player={true}>
        <ApplyColors />
        <PlayerHost />
      </PlayerProvider>
      {showCode ? <CodeBlock language="js">{trimmed}</CodeBlock> : null}
    </div>
  );
};
