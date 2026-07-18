import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";

const SCORE_URL = "/files/features/Chords.gp5";

function walkNotes(
  score: alphaTab.model.Score,
  fn: (note: alphaTab.model.Note) => void,
) {
  for (const track of score.tracks) {
    for (const staff of track.staves) {
      for (const bar of staff.bars) {
        for (const voice of bar.voices) {
          for (const beat of voice.beats) {
            for (const note of beat.notes) {
              fn(note);
            }
          }
        }
      }
    }
  }
}

function walkBeats(
  score: alphaTab.model.Score,
  fn: (beat: alphaTab.model.Beat) => void,
) {
  for (const track of score.tracks) {
    for (const staff of track.staves) {
      for (const bar of staff.bars) {
        for (const voice of bar.voices) {
          for (const beat of voice.beats) {
            fn(beat);
          }
        }
      }
    }
  }
}

export const MutateModelExample: React.FC = () => {
  const [api, element] = useAlphaTab((s) => {
    s.core.file = SCORE_URL;
  });
  const [ready, setReady] = useState(false);

  useAlphaTabEvent(api, "scoreLoaded", () => {
    setReady(true);
  });

  const uppercaseLyrics = () => {
    if (!api?.score) return;
    walkBeats(api.score, (beat) => {
      if (beat.lyrics && beat.lyrics.length > 0) {
        beat.lyrics = beat.lyrics.map((l) => (l ?? "").toUpperCase());
      } else {
        // Seed a syllable on beats that carry none so the mutation is visible.
        beat.lyrics = ["LA"];
      }
    });
    api.render();
  };

  const transposeDown = () => {
    if (!api?.score) return;
    walkNotes(api.score, (note) => {
      if (!Number.isNaN(note.octave)) {
        note.octave -= 1;
      } else if (!Number.isNaN(note.fret)) {
        note.fret = Math.max(0, note.fret - 12);
      }
    });
    api.loadMidiForScore();
    api.render();
  };

  const boostVelocities = () => {
    if (!api?.score) return;
    walkBeats(api.score, (beat) => {
      const next = Math.min(
        alphaTab.model.DynamicValue.FFF,
        (beat.dynamics ?? alphaTab.model.DynamicValue.MF) + 1,
      );
      beat.dynamics = next;
    });
    api.loadMidiForScore();
    api.render();
  };

  const reset = () => {
    if (!api) return;
    api.load(SCORE_URL);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <button
          className="button button--primary"
          onClick={uppercaseLyrics}
          disabled={!ready}
        >
          Uppercase all lyrics
        </button>
        <button
          className="button button--primary"
          onClick={transposeDown}
          disabled={!ready}
        >
          Transpose down an octave
        </button>
        <button
          className="button button--primary"
          onClick={boostVelocities}
          disabled={!ready}
        >
          Boost velocities
        </button>
        <button
          className="button button--secondary"
          onClick={reset}
          disabled={!ready}
        >
          Reset
        </button>
      </div>
      <p
        style={{
          fontSize: "0.9rem",
          opacity: 0.75,
          marginBottom: "0.75rem",
        }}
      >
        Each button walks the six-level tree, mutates one field, and re-renders.
      </p>
      <div ref={element}></div>
    </div>
  );
};
