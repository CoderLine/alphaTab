import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";

export interface TrackItemProps {
  api: alphaTab.AlphaTabApi;
  track: alphaTab.model.Track;
  isSelected: boolean;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  api,
  track,
  isSelected,
}) => {
  const [isMute, setMute] = useState(track.playbackInfo.isMute);
  useEffect(() => {
    track.playbackInfo.isMute = isMute;
    api.changeTrackMute([track], isMute);
  }, [isMute]);

  const [isSolo, setSolo] = useState(track.playbackInfo.isSolo);
  useEffect(() => {
    track.playbackInfo.isSolo = isSolo;
    api.changeTrackSolo([track], isSolo);
  }, [isSolo]);

  const [volume, setVolume] = useState(track.playbackInfo.volume);
  useEffect(() => {
    api.changeTrackSolo([track], isSolo);
    api.changeTrackVolume([track], volume / track.playbackInfo.volume);
  }, [volume]);

  const getTrackIcon = () => {
    if (track.staves.some((s) => s.isPercussion)) {
      return solid.faDrum;
    } else {
      // TODO: only font awesome pro has other instruments, we should create some SVGs or find
      // a free font.
      return solid.faGuitar;
    }
  };

  return (
    <div
      className={`${styles["at-track"]} ${isSelected ? styles.active : ""}`}
      onClick={() => api.renderTracks([track])}
    >
      <div className={styles["at-track-icon"]}>
        <FontAwesomeIcon icon={getTrackIcon()} />
      </div>
      <span className={styles["at-track-name"]}>{track.name}</span>
      <div className={styles["at-track-controls"]}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMute((v) => !v);
          }}
          className={`button button--danger button--sm ${
            isMute ? "" : "button--outline"
          }`}
        >
          Mute
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSolo((v) => !v);
          }}
          className={`button button--success button--sm ${
            isSolo ? "" : "button--outline"
          }`}
        >
          Solo
        </button>
        <FontAwesomeIcon icon={solid.faVolumeUp}></FontAwesomeIcon>
        <input
          type="range"
          min="0"
          max="16"
          defaultValue={volume}
          onInput={(e) =>
            setVolume((e.target as HTMLInputElement).valueAsNumber)
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={styles["at-track-volume"]}
        />
      </div>
    </div>
  );
};
