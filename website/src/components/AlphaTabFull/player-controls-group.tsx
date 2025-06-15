import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";
import { LayoutSelector } from "./layout-selector";
import { PlaybackSpeedSlider } from "./playback-speed-slider";
import { PlayerProgressIndicator } from "./player-progress-indicator";
import { ScoreDetails } from "./score-details";
import { ZoomLevelSelector } from "./zoom-level-selector";
import styles from "./styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import { useAlphaTabEvent } from "@site/src/hooks";
import { openFile } from "@site/src/utils";

export interface PlayerControlsGroupProps {
  api: alphaTab.AlphaTabApi;
  onLayoutChange?: (
    layoutMode: alphaTab.LayoutMode,
    scrollMode: alphaTab.ScrollMode
  ) => void;
}

export const PlayerControlsGroup: React.FC<PlayerControlsGroupProps> = ({
  api,
  onLayoutChange,
}) => {
  const [soundFontLoadPercentage, setSoundFontLoadPercentage] = useState(0);
  const [isLooping, setLooping] = useState(false);
  const [isCountInActive, setCountInActive] = useState(false);
  const [isMetronomeActive, setMetronomeActive] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [endTime, setEndTime] = useState(1);

  useAlphaTabEvent(api, "soundFontLoad", (e) => {
    setSoundFontLoadPercentage(e.loaded / e.total);
  });

  useAlphaTabEvent(api, "soundFontLoaded", () => {
    setSoundFontLoadPercentage(1);
  });
  useAlphaTabEvent(api, "playerStateChanged", (e) => {
    setPlaying(e.state == alphaTab.synth.PlayerState.Playing);
  });
  useAlphaTabEvent(api, "playerPositionChanged", (e) => {
    // reduce number of UI updates to second changes.
    const previousCurrentSeconds = (currentTime / 1000) | 0;
    const newCurrentSeconds = (e.currentTime / 1000) | 0;

    if (
      e.endTime === endTime &&
      (previousCurrentSeconds === newCurrentSeconds || newCurrentSeconds === 0)
    ) {
      return;
    }

    setEndTime(e.endTime);
    setCurrentTime(e.currentTime);
  });

  const open = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.mxml,.xml,.capx";
    input.onchange = () => {
      if (input.files?.length === 1) {
        openFile(api, input.files[0]);
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  useEffect(() => {
    api.countInVolume = isCountInActive ? 1 : 0;
  }, [isCountInActive]);

  useEffect(() => {
    api.metronomeVolume = isMetronomeActive ? 1 : 0;
  }, [isMetronomeActive]);

  useEffect(() => {
    api.isLooping = isLooping;
  }, [isLooping]);

  const download = () => {
    const exporter = new alphaTab.exporter.Gp7Exporter();
    const score = api.score!;
    const data = exporter.export(score, api.settings);
    const a = document.createElement("a");
    a.download =
      score.title.length > 0 ? score.title.trim() + ".gp" : "Untitled.gp";
    a.href = URL.createObjectURL(new Blob([data], { type: "application/gp" }));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDuration = (milliseconds: number) => {
    let seconds = milliseconds / 1000;
    const minutes = (seconds / 60) | 0;
    seconds = (seconds - minutes * 60) | 0;
    return (
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
    );
  };

  return (
    <>
      <div className={styles["at-time-slider"]}>
        <div
          className={styles["at-time-slider-value"]}
          style={{
            width: ((currentTime / endTime) * 100).toFixed(2) + "%",
          }}
        ></div>
      </div>
      <div className={styles["at-player"]}>
        <div className={styles["at-player-left"]}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              open();
            }}
            title="Open File"
          >
            <FontAwesomeIcon icon={solid.faFolderOpen} />
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              api.stop();
            }}
            title="Stop"
            className={api.isReadyForPlayback ? "" : " disabled"}
          >
            <FontAwesomeIcon icon={solid.faStepBackward} />
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              api.playPause();
            }}
            title="Play/Pause"
            className={api.isReadyForPlayback ? "" : " disabled"}
          >
            <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
          </a>

          <PlaybackSpeedSlider api={api} />
          <PlayerProgressIndicator percentage={soundFontLoadPercentage} />
          {api.score && <ScoreDetails score={api.score} />}

          <div className={styles["at-time-position"]} title="Time Position">
            {formatDuration(currentTime)} / {formatDuration(endTime)}
          </div>
        </div>

        <div className={styles["at-player-right"]}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCountInActive((v) => !v);
            }}
            className={
              (api.isReadyForPlayback ? "" : " disabled") +
              (isCountInActive ? " " + styles.active : "")
            }
            title="Count-In"
          >
            <FontAwesomeIcon icon={solid.faHourglassHalf} />
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMetronomeActive((v) => !v);
            }}
            className={
              (api.isReadyForPlayback ? "" : " disabled") +
              (isMetronomeActive ? " " + styles.active : "")
            }
            title="Metronome"
          >
            <FontAwesomeIcon icon={solid.faEdit} />
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setLooping((v) => !v);
            }}
            className={
              (api.isReadyForPlayback ? "" : " disabled") +
              (isLooping ? " " + styles.active : "")
            }
            title="Loop"
          >
            <FontAwesomeIcon icon={solid.faRetweet} />
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              api.print();
            }}
            className={api.isReadyForPlayback ? "" : " disabled"}
            title="Print"
          >
            <FontAwesomeIcon icon={solid.faPrint} />
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              download();
            }}
            className={api.isReadyForPlayback ? "" : " disabled"}
            title="Export to Guitar Pro 7"
          >
            <FontAwesomeIcon icon={solid.faDownload} />
          </a>

          <ZoomLevelSelector api={api} />
          <LayoutSelector onLayoutChange={onLayoutChange} />

          <div className={styles["at-logo"]}>
            powered by <img src="/img/alphaTab.png" />
          </div>
        </div>
      </div>
    </>
  );
};
