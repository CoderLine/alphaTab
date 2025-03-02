import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";

export interface PlaybackSpeedSliderProps {
  api: alphaTab.AlphaTabApi;
}

export const PlaybackSpeedSlider: React.FC<PlaybackSpeedSliderProps> = ({
  api,
}) => {
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    api.playbackSpeed = speed;
  }, [speed]);

  const speeds = [0.25, 0.5, 0.75, 0.9, 1, 1.24, 1.5, 2];
  return (
    <div className="dropdown dropdown--hoverable">
      <span title="Playback Speed">{speed}x</span>
      <ul className="dropdown__menu">
        {speeds.map((s) => (
          <li key={s}>
            <a 
              className="dropdown__link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSpeed(s);
              }}
            >
              {s}x
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
