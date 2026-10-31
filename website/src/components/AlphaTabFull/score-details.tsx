import * as alphaTab from "@coderline/alphatab";
import React from "react";
import styles from "./styles.module.scss";

export interface ScoreDetailsProps {
  score?: alphaTab.model.Score;
}

export interface ScoreDetailsState {}

export const ScoreDetails: React.FC<ScoreDetailsProps> = ({ score }) => {
  return (
    <div className={styles["at-song-details"]}>
      <span className={styles["at-song-title"]}>{score?.title}</span> -
      <span className={styles["at-song-artist"]}>{score?.artist}</span>
    </div>
  );
};
