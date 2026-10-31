import React from "react";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTabApi, useAlphaTabEventValue } from "@coderline/alphatab-react";
import { IconPause, IconPlay } from "@coderline/alphatab-ui";
import styles from "./styles.module.scss";

const isPlayingState = (state: alphaTab.synth.PlayerState) => state === alphaTab.synth.PlayerState.Playing;

/** Play/pause for the score of the surrounding `AlphaTabProvider`; disabled until the player is ready. */
export const DemoPlayButton: React.FC<{ className?: string }> = ({ className }) => {
  const api = useAlphaTabApi();
  const ready = useAlphaTabEventValue("playerReady", () => true, (a) => a.isReadyForPlayback) ?? false;
  const isPlaying =
    useAlphaTabEventValue("playerStateChanged", (e) => isPlayingState(e.state), (a) => isPlayingState(a.playerState)) ??
    false;

  return (
    <button
      type="button"
      className={`button button--primary button--sm ${styles.play} ${className ?? ""}`}
      onClick={() => api?.playPause()}
      disabled={!ready}
      aria-busy={!ready}
      aria-label={!ready ? "Preparing playback" : isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
    </button>
  );
};
