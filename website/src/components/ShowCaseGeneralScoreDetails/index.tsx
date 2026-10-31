import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";

export interface ScoreDetailsProps {
  file: string;
}

export const ScoreDetails: React.FC<ScoreDetailsProps> = ({ file }) => {
  const [score, setScore] = useState<alphaTab.model.Score>();
  const [error, setError] = useState(null);

  useEffect(() => {
    alphaTab.importer.ScoreLoader.loadScoreAsync(
      file,
      (score) => {
        setScore(score);
      },
      (error) => {
        setError(error);
      }
    );
  }, []);

  if (error) {
    return error;
  } else if (score) {
    return (
      <>
        <p>
          <strong>Title:</strong> {score.title}
        </p>
        <p>
          <strong>Subtitle:</strong> {score.subTitle}
        </p>
        <p>
          <strong>Album:</strong> {score.album}
        </p>
        <p>
          <strong>Tempo:</strong> {score.tempo}
        </p>
        <p>
          <strong>Bars:</strong> {score.masterBars.length}
        </p>
        <p>
          <strong>Tracks:</strong> {score.tracks.length}
        </p>
        <ul>
          {score.tracks.map((t) => (
            <li key={t.index}>{t.name}</li>
          ))}
        </ul>
      </>
    );
  } else {
    return "Loading...";
  }
};
