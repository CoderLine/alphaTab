import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import react, { useEffect } from "react";
import * as alphaTab from "@coderline/alphatab";
import CodeBlock from "@theme/CodeBlock";

export const ColoringExample: react.FC = () => {
  const tex = `
    \\title "Canon Rock"
    \\artist "JerryC"
    \\tempo 90
    .
    12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
    14.1.2 :8 17.2 15.1 14.1{h} 17.2 |
    15.2{v d}.4 :16 17.2{h} 15.2 :8 14.2 14.1 17.1{b (0 4 4 0)}.4 |
    15.1.8 :16 14.1{tu 3} 15.1{tu 3} 14.1{tu 3} :8 17.2 15.1 14.1 :16 12.1{tu 3} 14.1{tu 3} 12.1{tu 3} :8 15.2 14.2
    `;
  const [api, element] = useAlphaTab((s) => {});

  function applyColors(score: alphaTab.model.Score) {
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

  useEffect(() => {
    if (api) {
      const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
        new TextEncoder().encode(tex)
      );
      applyColors(score);
      api.renderScore(score, [0]);
    }
  }, [api]);

  return (
    <div>
      <div ref={element}></div>
      <CodeBlock language="js">{trimmed}</CodeBlock>
    </div>
  );
};
