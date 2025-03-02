import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useRef, useState } from "react";
import { PlayerControlsGroup } from "./player-controls-group";
import { TrackItem } from "./track-item";
import styles from "./styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import environment from "@site/src/environment";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import { openFile } from "@site/src/utils";

interface AlphaTabProps {
  settings?: alphaTab.json.SettingsJson;
}

export const AlphaTabFull: React.FC<AlphaTabProps> = ({ settings }) => {
  const viewPortRef = React.createRef<HTMLDivElement>();

  const [isLoading, setLoading] = useState(true);
  const [score, setScore] = useState<alphaTab.model.Score>();
  const [selectedTracks, setSelectedTracks] = useState(
    new Map<number, alphaTab.model.Track>()
  );

  const isAutomaticLayout = useRef(true);

  const [api, element] = useAlphaTab((s) => {
    s.player.scrollElement = viewPortRef.current!;
    s.player.scrollOffsetY = -10;
    s.player.enablePlayer = true;
    if (settings) {
      s.fillFromJson(settings);
    }
  });

  useAlphaTabEvent(api, "resize", (e) => {
    const settings = e.settings!;
    updateSettingsForLayout(
      settings,
      isAutomaticLayout.current ? undefined : settings.display.layoutMode,
      isAutomaticLayout.current ? undefined : settings.player.scrollMode,
      e.newWidth
    );
  });

  useAlphaTabEvent(api, "renderStarted", (isResize) => {
    setScore(api!.score!);

    const selectedTracks = new Map<number, alphaTab.model.Track>();
    api!.tracks.forEach((t) => {
      selectedTracks.set(t.index, t);
    });

    setLoading(!isResize);
    setSelectedTracks(selectedTracks);
  });

  useAlphaTabEvent(api, "renderFinished", () => {
    setLoading(false);
  });

  const onDragOver = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "link";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer) {
      const files = e.dataTransfer.files;
      if (files.length === 1) {
        openFile(api!, files[0]);
      }
    }
  };

  const onLayoutChange = (
    layoutMode: alphaTab.LayoutMode | undefined,
    scrollMode: alphaTab.ScrollMode | undefined
  ) => {
    const settings = api!.settings;
    isAutomaticLayout.current = layoutMode === undefined;
    updateSettingsForLayout(
      settings,
      layoutMode,
      scrollMode,
      viewPortRef.current?.offsetWidth ?? window.innerWidth
    );
    api!.updateSettings();
    api!.render();
  };

  const updateSettingsForLayout = (
    settings: alphaTab.Settings,
    layoutMode: alphaTab.LayoutMode | undefined,
    scrollMode: alphaTab.ScrollMode | undefined,
    width: number
  ) => {
    if (layoutMode == undefined) {
      if (width > 750) {
        settings.display.scale = 1;
        settings.display.layoutMode = alphaTab.LayoutMode.Page;
      } else {
        settings.display.scale = 0.8;
        settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
      }
    } else {
      if (width > 750) {
        settings.display.scale = 1;
      } else {
        settings.display.scale = 0.8;
      }
      settings.display.layoutMode = layoutMode;
      settings.player.scrollMode = scrollMode!;
    }
  };

  return (
    <div className={styles["at-wrap"]} onDragOver={onDragOver} onDrop={onDrop}>
      {isLoading && (
        <div className={styles["at-overlay"]}>
          <div className={styles["at-overlay-content"]}>
            <FontAwesomeIcon icon={solid.faSpinner} size="2x" spin={true} />
          </div>
        </div>
      )}

      <div className={styles["at-content"]}>
        <div className={styles["at-sidebar"]}>
          <div className={styles["at-sidebar-content"]}>
            <div className={styles["at-track-list"]}>
              {score?.tracks.map((t) => (
                <TrackItem
                  key={t.index}
                  api={api!}
                  isSelected={selectedTracks?.has(t.index)}
                  track={t}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles["at-viewport"]} ref={viewPortRef}>
          <div ref={element}></div>
        </div>
      </div>

      <div className={styles["at-footer"]}>
        {api && (
          <PlayerControlsGroup api={api} onLayoutChange={onLayoutChange} />
        )}
      </div>
    </div>
  );
};
