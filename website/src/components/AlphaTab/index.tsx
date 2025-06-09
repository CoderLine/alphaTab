import * as alphaTab from "@coderline/alphatab";
import environment from "@site/src/environment";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";

export interface AlphaTabProps {
  settings?: alphaTab.json.SettingsJson;
  file?: string;
  tracks?: number[] | "all";
  tex: boolean;
  children: string | React.ReactElement;
  player?: boolean;
}

export const AlphaTab: React.FC<AlphaTabProps> = ({
  settings,
  file,
  tracks,
  tex,
  children,
  player,
}) => {
  const [api, element] = useAlphaTab((s) => {
    if (file) {
      s.core.file = file;
    }
    if (tex) {
      s.core.tex = true;
    }
    if (tracks) {
      s.core.tracks = tracks;
    }

    if (player) {
      s.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
      s.player.scrollOffsetY = -50;
      s.player.scrollMode = alphaTab.ScrollMode.Off;
    }

    if (settings) {
      s.fillFromJson(settings);
    }
  });
  const [isPlaying, setPlaying] = useState(false);

  useAlphaTabEvent(
    api,
    "playerStateChanged",
    (args: alphaTab.synth.PlayerStateChangedEventArgs) => {
      setPlaying(args.state == alphaTab.synth.PlayerState.Playing);
    }
  );

  return (
    <div className={styles.wrapper}>
      {player && (
        <button
          className="button button--primary"
          onClick={() => api?.playPause()}
        >
          <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
        </button>
      )}
      <div ref={element}>{children}</div>
    </div>
  );
};
