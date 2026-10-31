import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabHost,
  AlphaTabProvider,
  useAlphaTabApi,
  useAlphaTabEventValue,
} from "@coderline/alphatab-react";
import { IconPause, IconPlay } from "@coderline/alphatab-ui";
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";

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

function PlayPauseButton() {
  const api = useAlphaTabApi();
  const isPlaying =
    useAlphaTabEventValue(
      "playerStateChanged",
      (e) => e.state === alphaTab.synth.PlayerState.Playing
    ) ?? false;
  return (
    <button
      className="button button--primary"
      onClick={() => api?.playPause()}
      disabled={!api}
    >
      {isPlaying ? (
        <IconPause aria-hidden="true" />
      ) : (
        <IconPlay aria-hidden="true" />
      )}
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
  const site = useSiteAlphaTabSettings({ player: true });

  const activeCss = themes[themeKey].css;

  return (
    <div className="player-cursor-demo">
      <style>{activeCss}</style>
      <AlphaTabProvider
        file="/files/features/Chords.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <PlayPauseButton />
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
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="css">{activeCss}</CodeBlock> : null}
    </div>
  );
};
