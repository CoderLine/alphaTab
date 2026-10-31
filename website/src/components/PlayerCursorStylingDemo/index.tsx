import React, { useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";

type ThemeKey = "default" | "blue" | "orange" | "dark";

interface Theme {
  label: string;
  css: string;
}

const themes: Record<ThemeKey, Theme> = {
  default: {
    label: "Reset",
    css: `.player-cursor-demo .at-cursor-bar {
  background: rgba(255, 242, 0, 0.25);
}
.player-cursor-demo .at-cursor-beat {
  background: rgba(64, 64, 255, 0.75);
  width: 3px;
}
.player-cursor-demo .at-highlight * {
  fill: #0078ff;
  stroke: #0078ff;
}`,
  },
  blue: {
    label: "Blue",
    css: `.player-cursor-demo .at-cursor-bar {
  background: rgba(33, 150, 243, 0.15);
}
.player-cursor-demo .at-cursor-beat {
  background: rgba(13, 71, 161, 0.9);
  width: 4px;
}
.player-cursor-demo .at-highlight * {
  fill: #1976d2;
  stroke: #1976d2;
}`,
  },
  orange: {
    label: "Orange",
    css: `.player-cursor-demo .at-cursor-bar {
  background: rgba(255, 152, 0, 0.2);
}
.player-cursor-demo .at-cursor-beat {
  background: rgba(230, 74, 25, 0.9);
  width: 4px;
}
.player-cursor-demo .at-highlight * {
  fill: #e64a19;
  stroke: #e64a19;
}`,
  },
  dark: {
    label: "Dark",
    css: `.player-cursor-demo .at-cursor-bar {
  background: rgba(97, 97, 97, 0.35);
}
.player-cursor-demo .at-cursor-beat {
  background: rgba(224, 224, 224, 0.95);
  width: 3px;
}
.player-cursor-demo .at-highlight * {
  fill: #ffca28;
  stroke: #ffca28;
}`,
  },
};

export interface PlayerCursorStylingDemoProps {
  showCode?: boolean;
}

function PlayerStateWatcher({
  onPlayingChange,
}: {
  onPlayingChange: (playing: boolean) => void;
}) {
  const module = useAlphaTabModule();
  useAlphaTabEvent(
    "playerStateChanged",
    (args: alphaTab.synth.PlayerStateChangedEventArgs) => {
      if (module) {
        onPlayingChange(args.state === module.synth.PlayerState.Playing);
      }
    }
  );
  return null;
}

function PlayPauseButton({ isPlaying }: { isPlaying: boolean }) {
  const api = useAlphaTabApi();
  return (
    <button
      className="button button--primary"
      onClick={() => api?.playPause()}
      disabled={!api}
    >
      <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
      <span style={{ marginLeft: "0.4rem" }}>
        {isPlaying ? "Pause" : "Play"}
      </span>
    </button>
  );
}

export const PlayerCursorStylingDemo: React.FC<
  PlayerCursorStylingDemoProps
> = ({ showCode = true }) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>("default");
  const [isPlaying, setPlaying] = useState(false);

  const activeCss = themes[themeKey].css;

  return (
    <div className="player-cursor-demo">
      <style>{activeCss}</style>
      <AlphaTabPlayer file="/files/features/Chords.gp5" player={true}>
        <PlayerStateWatcher onPlayingChange={setPlaying} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <PlayPauseButton isPlaying={isPlaying} />
          <ul className="pills" style={{ margin: 0 }}>
            {(Object.keys(themes) as ThemeKey[]).map((k) => (
              <li
                key={k}
                className={`pills__item${
                  themeKey === k ? " pills__item--active" : ""
                }`}
                onClick={() => setThemeKey(k)}
              >
                {themes[k].label}
              </li>
            ))}
          </ul>
        </div>
        <AlphaTabCanvas />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="css">{activeCss}</CodeBlock> : null}
    </div>
  );
};
