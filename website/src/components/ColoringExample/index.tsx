import React from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabEvent,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

export interface ColoringExampleProps {
  showCode?: boolean;
}

const TEX = `
    \\title "Canon Rock"
    \\artist "JerryC"
    \\tempo 90
    .
    12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
    14.1.2 :8 17.2 15.1 14.1{h} 17.2 |
    15.2{v d}.4 :16 17.2{h} 15.2 :8 14.2 14.1 17.1{b (0 4 4 0)}.4 |
    15.1.8 :16 14.1{tu 3} 15.1{tu 3} 14.1{tu 3} :8 17.2 15.1 14.1 :16 12.1{tu 3} 14.1{tu 3} 12.1{tu 3} :8 15.2 14.2
    `;

function ApplyColors() {
  const module = useAlphaTabModule();
  useAlphaTabEvent(
    "scoreLoaded",
    (score: alphaTab.model.Score) => {
      if (!module) return;
      // create custom style on score level
      score.style = new module.model.ScoreStyle();
      score.style.colors.set(
        module.model.ScoreSubElement.Title,
        module.model.Color.fromJson("#426d9d")!
      );
      score.style.colors.set(
        module.model.ScoreSubElement.Artist,
        module.model.Color.fromJson("#4cb3d4")!
      );

      const fretColors: Record<number, alphaTab.model.Color> = {
        12: module.model.Color.fromJson("#bb4648")!,
        13: module.model.Color.fromJson("#ab519f")!,
        14: module.model.Color.fromJson("#3953a5")!,
        15: module.model.Color.fromJson("#70ccd6")!,
        16: module.model.Color.fromJson("#6abd45")!,
        17: module.model.Color.fromJson("#e1a90e")!,
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
    },
    [module]
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
      alphaTab.model.ScoreSubElement.Artist,
      alphaTab.model.Color.fromJson("#4cb3d4")
    );

    const fretColors = {
        12: alphaTab.model.Color.fromJson("#bb4648"),
        13: alphaTab.model.Color.fromJson("#ab519f"),
        14: alphaTab.model.Color.fromJson("#3953a5"),
        15: alphaTab.model.Color.fromJson("#70ccd6"),
        16: alphaTab.model.Color.fromJson("#6abd45"),
        17: alphaTab.model.Color.fromJson("#e1a90e")
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
      <AlphaTabPlayer tex={TEX} player={false}>
        <ApplyColors />
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{trimmed}</CodeBlock> : null}
    </div>
  );
};
